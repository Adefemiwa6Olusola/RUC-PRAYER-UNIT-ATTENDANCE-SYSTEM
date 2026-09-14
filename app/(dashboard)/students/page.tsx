'use client';

import { useState, useEffect } from 'react';

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [viewingStudent, setViewingStudent] = useState<any>(null);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [deletingStudent, setDeletingStudent] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '', matricNo: '', image: ''
  });
  const [errorMsg, setErrorMsg] = useState('');

  const fetchStudents = async (query = '') => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/students?search=${encodeURIComponent(query)}&limit=100`);
      const data = await res.json();
      if (data && Array.isArray(data.students) && data.students.length > 0) {
        setStudents(data.students);
      } else if (Array.isArray(data) && data.length > 0) {
        setStudents(data);
      } else {
        setStudents([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => { fetchStudents(search); }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const openAddModal = () => {
    setFormData({ fullName: '', matricNo: '', image: '' });
    setErrorMsg('');
    setEditingStudent(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (student: any) => {
    setEditingStudent(student);
    setFormData({
      fullName: student.fullName || '',
      matricNo: student.matricNo || '',
      image: student.image || ''
    });
    setErrorMsg('');
    setIsAddModalOpen(true);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!formData.fullName.trim() || !formData.matricNo.trim()) {
      setErrorMsg('Full name and Matric number are required');
      return;
    }
    try {
      const isEditing = !!editingStudent;
      const url = isEditing ? `/api/students/${editingStudent.id}` : '/api/students';
      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      if (res.ok) {
        setEditingStudent(null);
        setIsAddModalOpen(false);
        fetchStudents(search);
      } else {
        const err = await res.json();
        setErrorMsg(err.error || 'Failed to save student data');
      }
    } catch (err) {
      setErrorMsg('Network error occurred');
    }
  };

  const confirmDeleteStudent = async () => {
    if (!deletingStudent) return;
    const targetId = deletingStudent.id;
    setIsDeleting(true);
    try {
      // Optimistically remove student card from UI immediately (0ms delay)
      setStudents(prev => prev.filter(s => s.id !== targetId));
      setDeletingStudent(null);

      const res = await fetch(`/api/students/${targetId}`, { method: 'DELETE' });
      if (!res.ok) {
        // Refresh list if API error occurred
        fetchStudents(search);
      }
    } catch (e) {
      console.error(e);
      fetchStudents(search);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      {/* Header Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#002f63' }}>Students</h1>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.15rem' }}>Manage registered member profiles and matric records</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <input
            type="text"
            placeholder="Search by name or matric..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', fontSize: '0.8rem', width: '14rem', outline: 'none' }}
          />
          <button onClick={openAddModal} style={{ padding: '0.55rem 1.1rem', borderRadius: '0.5rem', backgroundColor: '#002f63', color: 'white', fontWeight: 700, fontSize: '0.8rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            + Add Student
          </button>
        </div>
      </div>

      {/* Student Cards Grid */}
      {isLoading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>Loading student profiles...</div>
      ) : students.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af', backgroundColor: 'white', borderRadius: '0.75rem', border: '1px solid #f0f0f0' }}>
          <p style={{ fontWeight: 600, color: '#374151' }}>No Students Found</p>
          <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Try adjusting your search query or register a new student.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.25rem' }}>
          {students.map((student) => (
            <div key={student.id} style={{
              backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.25rem',
              textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            }}>
              {/* Avatar Icon Box */}
              <div style={{
                width: '5.25rem', height: '5.25rem', margin: '0 auto 0.75rem', borderRadius: '0.75rem',
                border: '2px solid #002f63', display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: 'white', overflow: 'hidden',
              }}>
                {student.image ? (
                  <img src={student.image} alt={student.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <svg width="42" height="42" fill="#374151" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                )}
              </div>

              {/* Name & Matric */}
              <h3 style={{ fontWeight: 700, fontSize: '0.85rem', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '0.15rem' }} title={student.fullName}>
                {student.fullName}
              </h3>
              <div style={{ margin: '0.35rem 0' }}>
                {(student.todayStatus === 'PRESENT' || student.isPresentToday) ? (
                  <span style={{
                    display: 'inline-block',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '9999px',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    backgroundColor: '#dcfce7',
                    color: '#16a34a',
                    letterSpacing: '0.04em',
                    border: '1px solid #bbf7d0'
                  }}>
                    ✓ PRESENT TODAY
                  </span>
                ) : (
                  <span style={{
                    display: 'inline-block',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '9999px',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    backgroundColor: '#fef2f2',
                    color: '#dc2626',
                    letterSpacing: '0.04em',
                    border: '1px solid #fecaca'
                  }}>
                    ABSENT
                  </span>
                )}
              </div>

              {/* Action Icons */}
              <div style={{
                display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '0.75rem',
                paddingTop: '0.75rem', borderTop: '1px solid #f3f4f6', color: '#9ca3af',
              }}>
                {/* View Profile Eye */}
                <button onClick={() => setViewingStudent(student)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '0.25rem' }} title="View Profile">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                {/* Edit Pencil */}
                <button onClick={() => openEditModal(student)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '0.25rem' }} title="Edit Profile">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                {/* Trash Delete */}
                <button onClick={() => setDeletingStudent(student)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '0.25rem' }} title="Remove Student">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Profile Modal (Simplified: ONLY Full Name & Matric No) */}
      {viewingStudent && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: '24rem', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', position: 'relative' }}>
            <button onClick={() => setViewingStudent(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#9ca3af' }}>✕</button>

            {/* Avatar Container */}
            <div style={{ width: '5.5rem', height: '5.5rem', margin: '0 auto 1.25rem', borderRadius: '0.75rem', border: '2px solid #002f63', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: 'white' }}>
              {viewingStudent.image ? (
                <img src={viewingStudent.image} alt={viewingStudent.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <svg width="48" height="48" fill="#374151" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
              )}
            </div>

            {/* Simplified Profile Details */}
            <div style={{ backgroundColor: '#f9fafb', borderRadius: '0.75rem', padding: '1.25rem', fontSize: '0.9rem', lineHeight: '2', border: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#111827' }}>
                <svg width="18" height="18" fill="none" stroke="#002f63" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                <span><strong>Name:</strong> {viewingStudent.fullName}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#111827' }}>
                <svg width="18" height="18" fill="none" stroke="#002f63" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 012-2h2a2 2 0 012 2v1m-4 0h4" /></svg>
                <span>
                  <strong>Matric Number:</strong>{' '}
                  <span style={{ fontFamily: 'monospace' }}>
                    {viewingStudent.matricNo.length > 5 ? viewingStudent.matricNo.slice(0, -5) : ''}
                    <span style={{ color: '#dc2626', fontWeight: 700 }}>{viewingStudent.matricNo.slice(-5)}</span>
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remove Student Modal */}
      {deletingStudent && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: '24rem', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', textAlign: 'center' }}>
            <div style={{
              width: '3.5rem', height: '3.5rem', borderRadius: '50%', backgroundColor: '#fef2f2',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem',
              border: '1px solid #fecaca',
            }}>
              <svg width="24" height="24" fill="none" stroke="#dc2626" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>

            <h3 style={{ fontWeight: 700, fontSize: '1.25rem', color: '#111827', marginBottom: '0.5rem' }}>Remove Student</h3>
            <p style={{ fontSize: '0.85rem', color: '#4b5563', marginBottom: '0.75rem', lineHeight: '1.4' }}>
              Are you sure you want to remove <strong>{deletingStudent.fullName}</strong>? This action cannot be undone.
            </p>
            <p style={{ fontSize: '0.75rem', color: '#dc2626', fontStyle: 'italic', marginBottom: '1.5rem' }}>
              Note: Student would only be removed from current's month attendance.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setDeletingStudent(null)}
                style={{
                  padding: '0.65rem', borderRadius: '0.5rem', fontSize: '0.85rem', fontWeight: 600,
                  border: '1px solid #d1d5db', backgroundColor: 'white', cursor: 'pointer', color: '#374151',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteStudent}
                disabled={isDeleting}
                style={{
                  padding: '0.65rem', borderRadius: '0.5rem', fontSize: '0.85rem', fontWeight: 700,
                  backgroundColor: '#dc2626', color: 'white', border: 'none', cursor: 'pointer',
                  opacity: isDeleting ? 0.7 : 1,
                }}
              >
                {isDeleting ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Add Student Modal (Simplified: ONLY Full Name & Matric No) */}
      {isAddModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: '28rem', boxShadow: '0 20px 50px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #f3f4f6' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1.15rem', color: '#111827' }}>{editingStudent ? 'Edit Student Data' : 'Add New Student'}</h3>
              <button onClick={() => { setIsAddModalOpen(false); setEditingStudent(null); }} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#9ca3af' }}>✕</button>
            </div>

            {errorMsg && (
              <div style={{ padding: '0.6rem', borderRadius: '0.5rem', backgroundColor: '#fef2f2', color: '#b91c1c', fontSize: '0.75rem', fontWeight: 600, marginBottom: '1rem', border: '1px solid #fecaca' }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveStudent}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem', display: 'block' }}>Full Name *</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Ogwogho Samuel Ohigbai"
                    required
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem', display: 'block' }}>Matric Number *</label>
                  <input
                    type="text"
                    value={formData.matricNo}
                    onChange={e => setFormData({ ...formData, matricNo: e.target.value })}
                    placeholder="e.g. RUN/CHE/23/14486"
                    required
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', fontSize: '0.9rem', outline: 'none', fontFamily: 'monospace' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.75rem', paddingTop: '1rem', borderTop: '1px solid #f3f4f6' }}>
                <button type="button" onClick={() => { setIsAddModalOpen(false); setEditingStudent(null); }} style={{ padding: '0.6rem 1.1rem', borderRadius: '0.5rem', fontSize: '0.85rem', fontWeight: 600, border: '1px solid #d1d5db', backgroundColor: 'white', cursor: 'pointer', color: '#374151' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '0.6rem 1.35rem', borderRadius: '0.5rem', fontSize: '0.85rem', fontWeight: 700, backgroundColor: '#002f63', color: 'white', border: 'none', cursor: 'pointer' }}>
                  {editingStudent ? 'Update' : 'Save Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
