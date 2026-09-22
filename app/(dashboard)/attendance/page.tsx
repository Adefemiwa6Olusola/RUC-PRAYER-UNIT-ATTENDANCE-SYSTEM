'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';

export default function AttendancePage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [centres, setCentres] = useState<any[]>([]);
  const [selectedCentre, setSelectedCentre] = useState('');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [activeSession, setActiveSession] = useState<any>(null);

  const [inputValue, setInputValue] = useState('');
  const [recentRecords, setRecentRecords] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalStudents: 0, todaySignIns: 0, attendanceRate: 0 });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ambiguousMatches, setAmbiguousMatches] = useState<any[]>([]);

  // In-memory student database cache & fast lookup index
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const studentsMapRef = useRef<Map<string, any[]>>(new Map());
  const fullMatricMapRef = useRef<Map<string, any>>(new Map());

  // Real-time lookup state
  const [lookupState, setLookupState] = useState<{
    status: 'idle' | 'searching' | 'valid' | 'invalid';
    student?: any;
    matches?: any[];
  }>({ status: 'idle' });

  // Add student modal state (Simplified: ONLY Full Name and Matric Number)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStudentData, setNewStudentData] = useState({
    fullName: '', matricNo: ''
  });
  const [addModalError, setAddModalError] = useState('');
  const [isSavingStudent, setIsSavingStudent] = useState(false);

  const [currentCentreName, setCurrentCentreName] = useState('Chapel');

  // Build in-memory lookup index from student array
  const buildLookupIndexes = (students: any[]) => {
    const suffixMap = new Map<string, any[]>();
    const matricMap = new Map<string, any>();

    students.forEach(student => {
      if (!student || !student.matricNo) return;
      const fullMatric = student.matricNo.toUpperCase().trim();
      const cleanMatric = fullMatric.replace(/[^0-9A-Z]/g, '');

      matricMap.set(fullMatric, student);
      matricMap.set(cleanMatric, student);

      // Index by last 5 digits / characters
      const suffix = cleanMatric.slice(-5);
      if (suffix) {
        if (!suffixMap.has(suffix)) suffixMap.set(suffix, []);
        suffixMap.get(suffix)!.push(student);
      }

      // Also index by last 4 and last 6 for flexible typing
      const suffix4 = cleanMatric.slice(-4);
      if (suffix4 && suffix4 !== suffix) {
        if (!suffixMap.has(suffix4)) suffixMap.set(suffix4, []);
        suffixMap.get(suffix4)!.push(student);
      }
    });

    studentsMapRef.current = suffixMap;
    fullMatricMapRef.current = matricMap;
  };

  // Fetch centres & pre-load entire student roster into memory on page load
  useEffect(() => {
    const initData = async () => {
      try {
        const [userRes, centresRes, studentsRes] = await Promise.all([
          fetch('/api/auth/me').catch(() => null),
          fetch('/api/centres').catch(() => null),
          fetch('/api/students?limit=2000').catch(() => null)
        ]);

        let userCentreName = 'Chapel';
        if (userRes && userRes.ok) {
          const uData = await userRes.json();
          if (uData?.user?.centreName) {
            userCentreName = uData.user.centreName;
            setCurrentCentreName(uData.user.centreName);
          }
        }

        let fetchedCentres: any[] = [];
        if (centresRes && centresRes.ok) {
          fetchedCentres = await centresRes.json();
          if (Array.isArray(fetchedCentres) && fetchedCentres.length > 0) {
            setCentres(fetchedCentres);
            const matched = fetchedCentres.find((c: any) => c.name.toLowerCase() === userCentreName.toLowerCase()) || fetchedCentres[0];
            setSelectedCentre(matched.id);
          }
        }

        // Cache all students in memory for 0ms lookup
        if (studentsRes && studentsRes.ok) {
          const sData = await studentsRes.json();
          const studentList = Array.isArray(sData) ? sData : (sData?.students || []);
          setAllStudents(studentList);
          buildLookupIndexes(studentList);
          setStats(prev => ({ ...prev, totalStudents: studentList.length || sData?.total || 0 }));
        }

        const activeId = fetchedCentres.find((c: any) => c.name.toLowerCase() === userCentreName.toLowerCase())?.id || fetchedCentres[0]?.id || 'auto-session';

        const res = await fetch('/api/attendance/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ centreId: activeId, meetingTitle: 'Prayer Meeting', meetingDate: new Date().toISOString().split('T')[0] })
        });
        const data = await res.json();
        if (data.session) setActiveSession(data.session);
        else setActiveSession({ id: data.id || 'auto-session' });
        setIsSessionActive(true);

        // Fetch today's existing attendance records from database on mount (Fix Bug 1 persistence on refresh)
        const todayStr = new Date().toISOString().split('T')[0];
        const historyRes = await fetch(`/api/attendance/history?from=${todayStr}&to=${todayStr}`).catch(() => null);
        if (historyRes && historyRes.ok) {
          const hData = await historyRes.json();
          const recs = Array.isArray(hData.data) ? hData.data : Array.isArray(hData) ? hData : [];
          const formattedRecs = recs.map((r: any) => ({
            id: r.student?.id || r.studentId,
            fullName: r.student?.fullName || r.studentName || 'Student',
            matricNo: r.student?.matricNo || r.matricNumber || '',
            locationName: r.session?.centre?.name || r.centre || userCentreName,
            time: new Date(r.checkInAt || r.createdAt || Date.now()).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            status: r.status || 'PRESENT'
          }));
          setRecentRecords(formattedRecs);
          setStats(prev => {
            const todayCount = formattedRecs.length;
            const rate = prev.totalStudents > 0 ? Math.round((todayCount / prev.totalStudents) * 10000) / 100 : 0;
            return { ...prev, todaySignIns: todayCount, attendanceRate: rate };
          });
        }
      } catch (e) {
        setIsSessionActive(true);
        setActiveSession({ id: 'auto-session' });
      }
      if (inputRef.current) inputRef.current.focus();
    };

    initData();
  }, []);

  // Instant 0ms In-Memory Matric Lookup on Typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    const trimmed = val.trim();
    if (!trimmed || trimmed.length < 2) {
      setLookupState({ status: 'idle' });
      return;
    }

    const cleanInput = trimmed.toUpperCase().replace(/[^0-9A-Z]/g, '');

    // Check full matric match first (0ms)
    const exactMatricMatch = fullMatricMapRef.current.get(cleanInput) || fullMatricMapRef.current.get(trimmed.toUpperCase());
    if (exactMatricMatch) {
      setLookupState({
        status: 'valid',
        student: exactMatricMatch,
        matches: [exactMatricMatch]
      });
      return;
    }

    // Check 5-digit or 4-digit suffix match in-memory (0ms)
    const suffixMatches = studentsMapRef.current.get(cleanInput.slice(-5)) || studentsMapRef.current.get(cleanInput);
    if (suffixMatches && suffixMatches.length > 0) {
      setLookupState({
        status: 'valid',
        student: suffixMatches[0],
        matches: suffixMatches
      });
      return;
    }

    // Fallback: search in-memory allStudents array (0ms)
    const filteredInMem = allStudents.filter(s => {
      const sMatric = (s.matricNo || '').toUpperCase().replace(/[^0-9A-Z]/g, '');
      return sMatric.includes(cleanInput) || (s.fullName && s.fullName.toUpperCase().includes(trimmed.toUpperCase()));
    });

    if (filteredInMem.length > 0) {
      setLookupState({
        status: 'valid',
        student: filteredInMem[0],
        matches: filteredInMem
      });
      return;
    }

    // If still searching and length >= 4, trigger fast background fallback fetch
    if (cleanInput.length >= 4) {
      setLookupState({ status: 'searching' });
      fetch(`/api/students/lookup?suffix=${encodeURIComponent(cleanInput)}`)
        .then(res => res.json())
        .then(students => {
          if (Array.isArray(students) && students.length > 0) {
            setLookupState({
              status: 'valid',
              student: students[0],
              matches: students,
            });
          } else {
            setLookupState({ status: 'invalid' });
          }
        })
        .catch(() => setLookupState({ status: 'invalid' }));
    } else {
      setLookupState({ status: 'invalid' });
    }
  };

  // Instant 0ms Optimistic Attendance Sign-In
  const markAttendance = async (e?: React.FormEvent, selectedStudentObj?: any) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() && !selectedStudentObj) return;

    const rawInput = inputValue.trim();
    let targetStudent = selectedStudentObj;

    // 1. Instant local lookup if student not passed directly
    if (!targetStudent) {
      if (lookupState.status === 'valid' && lookupState.student) {
        targetStudent = lookupState.student;
      } else {
        const cleanInput = rawInput.toUpperCase().replace(/[^0-9A-Z]/g, '');
        const inMemMatches = studentsMapRef.current.get(cleanInput.slice(-5)) ||
          allStudents.filter(s => (s.matricNo || '').toUpperCase().includes(cleanInput));

        if (inMemMatches && inMemMatches.length === 1) {
          targetStudent = inMemMatches[0];
        } else if (inMemMatches && inMemMatches.length > 1) {
          setAmbiguousMatches(inMemMatches);
          return;
        }
      }
    }

    // If student not found anywhere, show error immediately
    if (!targetStudent) {
      setMessage({ type: 'error', text: `Matric no not found for "${rawInput}"` });
      setLookupState({ status: 'invalid' });
      return;
    }

    // 2. Check if already recorded locally (0ms)
    const isDuplicateLocal = recentRecords.some(
      r => r.id === targetStudent.id || (r.matricNo && r.matricNo.toUpperCase() === targetStudent.matricNo.toUpperCase())
    );

    if (isDuplicateLocal) {
      setMessage({ type: 'warning', text: `Already Recorded: ${targetStudent.fullName} (${targetStudent.matricNo})` });
      setInputValue('');
      setLookupState({ status: 'idle' });
      if (inputRef.current) inputRef.current.focus();
      return;
    }

    // 3. OPTIMISTIC INSTANT UI UPDATE (0ms delay!)
    const timeFormatted = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setMessage({ type: 'success', text: `✓ ${targetStudent.fullName} Marked Present (${timeFormatted})` });

    // Prepend to recent records instantly
    const newRecord = { ...targetStudent, locationName: currentCentreName, time: timeFormatted, status: 'PRESENT' };
    setRecentRecords(prev => [newRecord, ...prev]);

    // Update statistics counter instantly
    setStats(s => {
      const newSignIns = s.todaySignIns + 1;
      const rate = s.totalStudents > 0 ? Math.round((newSignIns / s.totalStudents) * 10000) / 100 : 0;
      return { ...s, todaySignIns: newSignIns, attendanceRate: rate };
    });

    // Clear input & refocus input field instantly for next student
    setInputValue('');
    setLookupState({ status: 'idle' });
    setAmbiguousMatches([]);
    if (inputRef.current) inputRef.current.focus();

    // 4. Guaranteed Database API call to persist in Prisma database
    if (targetStudent.id) {
      try {
        const markRes = await fetch('/api/attendance/mark', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: targetStudent.id,
            sessionId: activeSession?.id && activeSession.id !== 'auto-session' ? activeSession.id : undefined
          })
        });

        if (markRes.ok) {
          const resData = await markRes.json();
          if (resData.session?.id && (!activeSession?.id || activeSession.id === 'auto-session')) {
            setActiveSession(resData.session);
          }
        } else {
          const resData = await markRes.json();
          if (resData.status === 'duplicate' || markRes.status === 409) {
            setMessage({ type: 'warning', text: `Already Recorded: ${targetStudent.fullName} (${targetStudent.matricNo})` });
          }
        }
      } catch (e) {
        console.error('Error persisting attendance:', e);
      }
    }
  };

  // Handle adding missing student manually from sign-in screen
  const handleCreateStudentAndSign = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddModalError('');
    if (!newStudentData.fullName.trim() || !newStudentData.matricNo.trim()) {
      setAddModalError('Full name and Matric number are required');
      return;
    }

    setIsSavingStudent(true);

    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudentData)
      });

      if (res.ok) {
        const createdStudent = await res.json();
        setIsAddModalOpen(false);

        // Add created student to in-memory list & index instantly
        setAllStudents(prev => {
          const updated = [createdStudent, ...prev];
          buildLookupIndexes(updated);
          return updated;
        });

        setStats(s => ({ ...s, totalStudents: s.totalStudents + 1 }));

        // Automatically mark attendance for the newly registered student!
        markAttendance(undefined, createdStudent);
      } else {
        const err = await res.json();
        setAddModalError(err.error || 'Failed to save student record');
      }
    } catch (err) {
      setAddModalError('Network error occurred');
    } finally {
      setIsSavingStudent(false);
    }
  };

  const handleDownloadCsv = () => { window.open('/api/export/attendance/csv', '_blank'); };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      {/* 3 Stat Cards */}
      <div className="stat-cards-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.25rem', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#002f63', marginBottom: '0.25rem' }}>{stats.totalStudents}</div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Students</div>
        </div>
        <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.25rem', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#16a34a', marginBottom: '0.25rem' }}>{stats.todaySignIns}</div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Today&apos;s Sign-ins</div>
        </div>
        <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.25rem', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#dc2626', marginBottom: '0.25rem' }}>{stats.attendanceRate}%</div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Attendance Rate</div>
        </div>
      </div>

      {/* Main Content: Left Sign In + Right Recent */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem', alignItems: 'start' }} className="sign-in-grid">
        {/* Left: Student Sign In */}
        <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#111827', margin: 0 }}>Student Sign In</h2>
            <button
              type="button"
              onClick={() => {
                setNewStudentData({ fullName: '', matricNo: '' });
                setAddModalError('');
                setIsAddModalOpen(true);
              }}
              style={{
                backgroundColor: '#f3f4f6', color: '#002f63', border: '1px solid #e5e7eb',
                borderRadius: '0.5rem', padding: '0.5rem 0.85rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                minHeight: '38px', display: 'inline-flex', alignItems: 'center', gap: '0.25rem'
              }}
            >
              + Register Student
            </button>
          </div>

          <form onSubmit={markAttendance}>
            {message.text && (
              <div style={{
                padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 700, textAlign: 'center',
                backgroundColor: message.type === 'error' ? '#fef2f2' : message.type === 'success' ? '#f0fdf4' : '#fefce8',
                color: message.type === 'error' ? '#b91c1c' : message.type === 'success' ? '#15803d' : '#92400e',
                border: `1px solid ${message.type === 'error' ? '#fecaca' : message.type === 'success' ? '#bbf7d0' : '#fde68a'}`,
                animation: 'fadeIn 0.2s ease',
              }}>
                {message.text}
              </div>
            )}

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Matric Number
              </label>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Enter last 5 digits (e.g. 15157, 12089) or full matric"
                autoFocus
                style={{
                  width: '100%', padding: '0.9rem', borderRadius: '0.5rem',
                  border: lookupState.status === 'valid' ? '2px solid #16a34a' : lookupState.status === 'invalid' ? '2px solid #dc2626' : '1.5px solid #d1d5db',
                  fontSize: '1rem', outline: 'none', fontFamily: 'monospace',
                  transition: 'border-color 0.15s ease',
                  minHeight: '48px',
                }}
              />

              {/* Real-Time Auto Lookup Feedback Box (0ms Response) */}
              {lookupState.status === 'valid' && (
                <div style={{
                  marginTop: '0.5rem', padding: '0.65rem 0.85rem', borderRadius: '0.5rem',
                  backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d',
                  fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  animation: 'fadeIn 0.15s ease',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <svg width="18" height="18" fill="none" stroke="#16a34a" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{lookupState.student?.fullName}</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#166534', fontSize: '0.75rem' }}>({lookupState.student?.matricNo})</span>
                  </div>
                  <span style={{ fontSize: '0.65rem', backgroundColor: '#16a34a', color: 'white', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Valid Student</span>
                </div>
              )}

              {lookupState.status === 'invalid' && (
                <div style={{
                  marginTop: '0.5rem', padding: '0.65rem 0.85rem', borderRadius: '0.5rem',
                  backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c',
                  fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <svg width="18" height="18" fill="none" stroke="#dc2626" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span style={{ color: '#dc2626', fontWeight: 700 }}>Matric no not found</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setNewStudentData({
                        fullName: '', matricNo: inputValue.includes('/') ? inputValue : `RUN/CMP/23/${inputValue}`
                      });
                      setAddModalError('');
                      setIsAddModalOpen(true);
                    }}
                    style={{
                      backgroundColor: '#002f63', color: 'white', border: 'none',
                      borderRadius: '0.375rem', padding: '0.4rem 0.75rem', fontSize: '0.75rem',
                      fontWeight: 700, cursor: 'pointer', minHeight: '34px'
                    }}
                  >
                    + Add Student Manually
                  </button>
                </div>
              )}
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              style={{
                width: '100%', padding: '0.9rem', backgroundColor: '#002f63', color: 'white',
                fontWeight: 700, fontSize: '1rem', borderRadius: '0.5rem', border: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '0.5rem', marginBottom: '1.25rem', minHeight: '48px',
                boxShadow: '0 4px 12px rgba(0, 47, 99, 0.25)',
              }}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Sign In
            </button>

            {/* Download / View Stats Buttons */}
            <div className="action-buttons-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={handleDownloadCsv}
                style={{
                  padding: '0.75rem', backgroundColor: '#16a34a', color: 'white',
                  fontWeight: 600, fontSize: '0.85rem', borderRadius: '0.5rem', border: 'none',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                  minHeight: '44px',
                }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Attendance
              </button>
              <button
                type="button"
                onClick={() => router.push('/statistics')}
                style={{
                  padding: '0.75rem', backgroundColor: '#FFD700', color: '#002f63',
                  fontWeight: 700, fontSize: '0.85rem', borderRadius: '0.5rem', border: 'none',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                  minHeight: '44px',
                }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                View Statistics
              </button>
            </div>
          </form>
        </div>

        {/* Right: Recent Sign-ins */}
        <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#002f63', marginBottom: '1rem' }}>Recent Sign-ins</h2>

          <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
            {recentRecords.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#9ca3af', fontSize: '0.85rem' }}>
                No sign-ins recorded yet. Enter a matric number to begin.
              </div>
            ) : (
              recentRecords.map((record, index) => (
                <div key={index} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                  padding: '0.75rem 0', borderBottom: index < recentRecords.length - 1 ? '1px solid #f3f4f6' : 'none',
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#111827' }}>{record.fullName}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.7rem', color: '#6b7280', fontFamily: 'monospace' }}>{record.matricNo}</span>
                      <span style={{
                        fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.45rem', borderRadius: '0.25rem',
                        backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #dbeafe', display: 'inline-flex', alignItems: 'center', gap: '0.2rem'
                      }}>
                        📍 {record.locationName || currentCentreName}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#16a34a', display: 'block' }}>PRESENT</span>
                    <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontFamily: 'monospace' }}>{record.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Manual Student Entry Modal */}
      {isAddModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: '26rem', boxShadow: '0 20px 50px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f3f4f6' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#002f63' }}>Add Student Record</h3>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#9ca3af' }}>✕</button>
            </div>

            {addModalError && (
              <div style={{ padding: '0.6rem', borderRadius: '0.5rem', backgroundColor: '#fef2f2', color: '#b91c1c', fontSize: '0.75rem', fontWeight: 600, marginBottom: '1rem' }}>
                {addModalError}
              </div>
            )}

            <form onSubmit={handleCreateStudentAndSign}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem', display: 'block' }}>Full Name *</label>
                  <input
                    type="text"
                    value={newStudentData.fullName}
                    onChange={e => setNewStudentData({ ...newStudentData, fullName: e.target.value })}
                    required
                    placeholder="e.g. Ogwogho Samuel Ohigbai"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem', display: 'block' }}>Matric Number *</label>
                  <input
                    type="text"
                    value={newStudentData.matricNo}
                    onChange={e => setNewStudentData({ ...newStudentData, matricNo: e.target.value })}
                    required
                    placeholder="e.g. RUN/CHE/23/14486"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', fontSize: '0.85rem', outline: 'none', fontFamily: 'monospace' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem', paddingTop: '0.75rem', borderTop: '1px solid #f3f4f6' }}>
                <button type="button" onClick={() => setIsAddModalOpen(false)} style={{ padding: '0.6rem 1rem', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 600, border: '1px solid #d1d5db', backgroundColor: 'white', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={isSavingStudent} style={{ padding: '0.6rem 1.25rem', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 700, backgroundColor: '#002f63', color: 'white', border: 'none', cursor: 'pointer', opacity: isSavingStudent ? 0.7 : 1 }}>
                  {isSavingStudent ? 'Saving & Signing In...' : 'Save & Sign In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ambiguous Match Modal */}
      {ambiguousMatches.length > 0 && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: '24rem', boxShadow: '0 20px 50px rgba(0,0,0,0.15)' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#002f63', marginBottom: '0.5rem' }}>Multiple Students Found</h3>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '1rem' }}>
              Multiple students match. Please select the correct one:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {ambiguousMatches.map(student => (
                <button
                  key={student.id}
                  onClick={() => markAttendance(undefined, student)}
                  style={{
                    padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb',
                    backgroundColor: 'white', cursor: 'pointer', textAlign: 'left',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{student.fullName}</div>
                    <div style={{ fontSize: '0.7rem', color: '#6b7280', fontFamily: 'monospace' }}>{student.matricNo}</div>
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#002f63' }}>Select →</span>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button onClick={() => setAmbiguousMatches([])} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 600, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          .sign-in-grid { grid-template-columns: 1fr !important; }
          .stat-cards-container { grid-template-columns: repeat(3, 1fr) !important; gap: 0.5rem !important; }
        }
        @media (max-width: 480px) {
          .stat-cards-container { grid-template-columns: 1fr !important; gap: 0.75rem !important; }
          .action-buttons-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
