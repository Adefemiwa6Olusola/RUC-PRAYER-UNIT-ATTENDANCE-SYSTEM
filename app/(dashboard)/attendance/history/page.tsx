'use client';

import { useState, useEffect } from 'react';

export default function AttendanceHistoryPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [centres, setCentres] = useState<any[]>([]);
  const [filters, setFilters] = useState({ from: '', to: '', centreId: '' });
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Interactive Calendar State
  const [isCalendarOpen, setIsCalendarOpen] = useState(true);
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<string>('');

  useEffect(() => {
    fetchCentres();
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [filters, pagination.page]);

  const fetchCentres = async () => {
    try {
      const res = await fetch('/api/centres');
      if (res.ok) setCentres(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRecords = async () => {
    setLoading(true);
    setError('');
    try {
      const query = new URLSearchParams({
        from: filters.from,
        to: filters.to,
        centreId: filters.centreId,
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      }).toString();

      const res = await fetch(`/api/attendance/history?${query}`);
      if (!res.ok) throw new Error('Failed to fetch records');
      const data = await res.json();
      const rawRecords = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
      const formatted = rawRecords.map((r: any) => ({
        id: r.id,
        date: r.checkInAt || r.createdAt || new Date().toISOString(),
        meeting: r.session?.meeting?.title || r.meeting || 'Prayer Meeting',
        centre: r.session?.centre?.name || r.centre || 'Chapel',
        studentName: r.student?.fullName || r.studentName || 'Student',
        matricNumber: r.student?.matricNo || r.matricNumber || '',
        status: r.status || 'PRESENT',
        time: new Date(r.checkInAt || r.createdAt || Date.now()).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
      }));
      setRecords(formatted);
      setPagination(prev => ({ ...prev, total: data.total || formatted.length }));
    } catch (err: any) {
      setError(err.message || 'Error loading attendance history');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setPagination(prev => ({ ...prev, page: 1 }));
    setSelectedCalendarDay('');
  };

  const isSunday = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.getDay() === 0;
  };

  // Calendar Helpers
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentCalendarDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentCalendarDate(new Date(year, month + 1, 1));

  const selectDay = (dayNum: number) => {
    const paddedMonth = String(month + 1).padStart(2, '0');
    const paddedDay = String(dayNum).padStart(2, '0');
    const dateStr = `${year}-${paddedMonth}-${paddedDay}`;

    setSelectedCalendarDay(dateStr);
    setFilters(prev => ({ ...prev, from: dateStr, to: dateStr }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const setPresetFilter = (preset: 'today' | 'yesterday' | 'week' | 'month' | 'clear') => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (preset === 'today') {
      setFilters(prev => ({ ...prev, from: todayStr, to: todayStr }));
      setSelectedCalendarDay(todayStr);
    } else if (preset === 'yesterday') {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      const yStr = y.toISOString().split('T')[0];
      setFilters(prev => ({ ...prev, from: yStr, to: yStr }));
      setSelectedCalendarDay(yStr);
    } else if (preset === 'week') {
      const w = new Date(now);
      w.setDate(w.getDate() - 7);
      setFilters(prev => ({ ...prev, from: w.toISOString().split('T')[0], to: todayStr }));
      setSelectedCalendarDay('');
    } else if (preset === 'month') {
      const m = new Date(now.getFullYear(), now.getMonth(), 1);
      setFilters(prev => ({ ...prev, from: m.toISOString().split('T')[0], to: todayStr }));
      setSelectedCalendarDay('');
    } else {
      setFilters({ from: '', to: '', centreId: '' });
      setSelectedCalendarDay('');
    }
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const inputStyle = { padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.85rem' };
  const thStyle = { textAlign: 'left' as const, padding: '0.85rem 1rem', borderBottom: '2px solid #e5e7eb', color: '#002f63', fontWeight: 700, fontSize: '0.85rem' };
  const tdStyle = { padding: '0.85rem 1rem', borderBottom: '1px solid #f3f4f6', color: '#374151', fontSize: '0.85rem' };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ color: '#002f63', margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Attendance History & Calendar Filter</h1>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.15rem' }}>Select dates on the calendar to instantly retrieve recorded sign-ins</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
            style={{ backgroundColor: '#f3f4f6', color: '#002f63', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}
          >
            {isCalendarOpen ? '✕ Hide Calendar' : '📅 Show Calendar View'}
          </button>
          <a
            href="/api/export/attendance/csv"
            target="_blank"
            style={{ background: '#16a34a', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Export CSV
          </a>
        </div>
      </div>

      {/* Calendar Filter Widget */}
      {isCalendarOpen && (
        <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem' }} className="calendar-grid-container">
            
            {/* Visual Calendar */}
            <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem', backgroundColor: '#fafafa' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, color: '#002f63', fontSize: '1rem' }}>‹</button>
                <div style={{ fontWeight: 700, color: '#002f63', fontSize: '0.9rem' }}>{monthNames[month]} {year}</div>
                <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, color: '#002f63', fontSize: '1rem' }}>›</button>
              </div>

              {/* Days Header */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontSize: '0.65rem', fontWeight: 700, color: '#6b7280', marginBottom: '0.35rem' }}>
                <span style={{ color: '#dc2626' }}>Su</span>
                <span>Mo</span>
                <span>Tu</span>
                <span>We</span>
                <span>Th</span>
                <span>Fr</span>
                <span>Sa</span>
              </div>

              {/* Days Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px', textAlign: 'center' }}>
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const paddedMonth = String(month + 1).padStart(2, '0');
                  const paddedDay = String(dayNum).padStart(2, '0');
                  const dStr = `${year}-${paddedMonth}-${paddedDay}`;
                  const isSelected = selectedCalendarDay === dStr;
                  const dayOfWeek = new Date(year, month, dayNum).getDay();
                  const isSun = dayOfWeek === 0;

                  return (
                    <button
                      key={dayNum}
                      onClick={() => selectDay(dayNum)}
                      style={{
                        padding: '0.4rem 0', borderRadius: '0.375rem', border: isSelected ? '2px solid #002f63' : '1px solid transparent',
                        backgroundColor: isSelected ? '#002f63' : isSun ? '#fef2f2' : 'white',
                        color: isSelected ? 'white' : isSun ? '#dc2626' : '#111827',
                        fontSize: '0.75rem', fontWeight: isSelected || isSun ? 700 : 500, cursor: 'pointer',
                      }}
                    >
                      {dayNum}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Controls & Quick Presets */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#002f63', marginBottom: '0.75rem' }}>Filter Options</h3>
                
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.2rem' }}>From Date</label>
                    <input type="date" name="from" value={filters.from} onChange={handleFilterChange} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.2rem' }}>To Date</label>
                    <input type="date" name="to" value={filters.to} onChange={handleFilterChange} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.2rem' }}>Location / Centre</label>
                    <select name="centreId" value={filters.centreId} onChange={handleFilterChange} style={inputStyle}>
                      <option value="">All Centres</option>
                      {centres.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Quick Preset Badges */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button onClick={() => setPresetFilter('today')} style={{ padding: '0.35rem 0.75rem', borderRadius: '9999px', border: '1px solid #d1d5db', backgroundColor: '#f9fafb', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Today</button>
                  <button onClick={() => setPresetFilter('yesterday')} style={{ padding: '0.35rem 0.75rem', borderRadius: '9999px', border: '1px solid #d1d5db', backgroundColor: '#f9fafb', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Yesterday</button>
                  <button onClick={() => setPresetFilter('week')} style={{ padding: '0.35rem 0.75rem', borderRadius: '9999px', border: '1px solid #d1d5db', backgroundColor: '#f9fafb', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Last 7 Days</button>
                  <button onClick={() => setPresetFilter('month')} style={{ padding: '0.35rem 0.75rem', borderRadius: '9999px', border: '1px solid #d1d5db', backgroundColor: '#f9fafb', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', color: '#374151' }}>This Month</button>
                  <button onClick={() => setPresetFilter('clear')} style={{ padding: '0.35rem 0.75rem', borderRadius: '9999px', border: '1px solid #fecaca', backgroundColor: '#fef2f2', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', color: '#dc2626' }}>Reset Filter</button>
                </div>
              </div>

              {/* Status summary */}
              <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: '#eff6ff', border: '1px solid #dbeafe', fontSize: '0.75rem', color: '#1e40af', marginTop: '1rem' }}>
                Showing <strong>{pagination.total}</strong> attendance record(s) {filters.from ? `for ${filters.from}` : 'for all dates'}.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Records Table */}
      <div style={{ background: 'white', border: '1px solid #f0f0f0', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Meeting</th>
              <th style={thStyle}>Centre</th>
              <th style={thStyle}>Student Name</th>
              <th style={thStyle}>Matric Number</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Time</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>Loading attendance records...</td></tr>
            ) : error ? (
              <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#dc2626' }}>{error}</td></tr>
            ) : records.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No attendance records found for the selected criteria.</td></tr>
            ) : (
              records.map((record, i) => (
                <tr key={i} style={{ backgroundColor: isSunday(record.date) ? '#fee2e2' : 'transparent' }}>
                  <td style={tdStyle}>{new Date(record.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td style={tdStyle}>{record.meeting || 'Prayer Meeting'}</td>
                  <td style={tdStyle}>{record.centre || 'Chapel'}</td>
                  <td style={{ ...tdStyle, fontWeight: 600, color: '#111827' }}>{record.studentName}</td>
                  <td style={{ ...tdStyle, fontFamily: 'monospace' }}>{record.matricNumber}</td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: record.status === 'PRESENT' ? '#dcfce7' : '#fee2e2',
                      color: record.status === 'PRESENT' ? '#16a34a' : '#dc2626'
                    }}>
                      {record.status}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, fontFamily: 'monospace' }}>{record.time}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
        <span style={{ color: '#666', fontSize: '0.8rem' }}>Page {pagination.page}</span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            disabled={pagination.page === 1}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            style={{ padding: '0.4rem 0.85rem', border: '1px solid #ccc', borderRadius: '0.375rem', background: 'white', cursor: pagination.page === 1 ? 'not-allowed' : 'pointer', fontSize: '0.8rem' }}
          >Previous</button>
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            style={{ padding: '0.4rem 0.85rem', border: '1px solid #ccc', borderRadius: '0.375rem', background: 'white', cursor: 'pointer', fontSize: '0.8rem' }}
          >Next</button>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .calendar-grid-container { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
