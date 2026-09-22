'use client';

import { useState, useEffect } from 'react';

export default function StatisticsPage() {
  const [rangePreset, setRangePreset] = useState<'today' | 'week' | 'month' | 'all'>('today');
  const [stats, setStats] = useState({ totalStudents: 0, totalPresent: 0, averageAttendanceRate: 0, recordList: [] as any[] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, [rangePreset]);

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const now = new Date();
      let fromStr = now.toISOString().split('T')[0];
      let toStr = fromStr;

      if (rangePreset === 'week') {
        const w = new Date(now);
        w.setDate(w.getDate() - 7);
        fromStr = w.toISOString().split('T')[0];
      } else if (rangePreset === 'month') {
        const m = new Date(now.getFullYear(), now.getMonth(), 1);
        fromStr = m.toISOString().split('T')[0];
      } else if (rangePreset === 'all') {
        fromStr = '2020-01-01';
      }

      const [reportsRes, studentsRes] = await Promise.all([
        fetch(`/api/reports/daily?from=${fromStr}&to=${toStr}`).catch(() => null),
        fetch('/api/students?limit=2000').catch(() => null)
      ]);

      let studentCount = 0;
      if (studentsRes && studentsRes.ok) {
        const sData = await studentsRes.json();
        studentCount = sData.total || (Array.isArray(sData) ? sData.length : Array.isArray(sData.students) ? sData.students.length : 0);
      }

      let presentCount = 0;
      let recs: any[] = [];

      if (reportsRes && reportsRes.ok) {
        const rData = await reportsRes.json();
        if (rData && typeof rData.totalPresent === 'number') {
          presentCount = rData.totalPresent;
          recs = rData.records || [];
        } else if (Array.isArray(rData)) {
          rData.forEach(session => {
            if (session.attendanceRecords) {
              presentCount += session.attendanceRecords.filter((r: any) => r.status === 'PRESENT').length;
              recs.push(...session.attendanceRecords);
            }
          });
        }
      }

      const rate = studentCount > 0 ? Math.round((presentCount / studentCount) * 10000) / 100 : 0;

      setStats({
        totalStudents: studentCount,
        totalPresent: presentCount,
        averageAttendanceRate: rate,
        recordList: recs
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred loading statistics');
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = {
    background: 'white',
    border: '1px solid #f0f0f0',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ color: '#002f63', margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Attendance Statistics</h1>
          <p style={{ color: '#6b7280', margin: '0.25rem 0 0 0', fontSize: '0.8rem' }}>Real-time analytical overview of member attendance performance</p>
        </div>

        {/* Range Filter Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'white', padding: '0.25rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
          {[
            { id: 'today', label: 'Today' },
            { id: 'week', label: 'Last 7 Days' },
            { id: 'month', label: 'This Month' },
            { id: 'all', label: 'All Time' },
          ].map(btn => {
            const isActive = rangePreset === btn.id;
            return (
              <button
                key={btn.id}
                onClick={() => setRangePreset(btn.id as any)}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '0.375rem',
                  fontSize: '0.75rem',
                  fontWeight: isActive ? 700 : 500,
                  border: 'none',
                  backgroundColor: isActive ? '#002f63' : 'transparent',
                  color: isActive ? 'white' : '#4b5563',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 2px 4px rgba(0, 47, 99, 0.2)' : 'none',
                }}
              >
                {btn.label}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div style={{ color: '#002f63', padding: '3rem', textAlign: 'center' }}>Loading attendance metrics...</div>
      ) : error ? (
        <div style={{ color: '#dc2626', background: '#fee2e2', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.85rem' }}>{error}</div>
      ) : (
        <>
          {/* Stat Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={cardStyle}>
              <span style={{ color: '#6b7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Total Students</span>
              <h2 style={{ color: '#002f63', margin: 0, fontSize: '2.25rem', fontWeight: 800 }}>{stats.totalStudents}</h2>
            </div>
            <div style={cardStyle}>
              <span style={{ color: '#6b7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                {rangePreset === 'today' ? 'Total Present Today' : rangePreset === 'week' ? 'Sign-ins (Last 7 Days)' : rangePreset === 'month' ? 'Sign-ins (This Month)' : 'Total Recorded Sign-ins'}
              </span>
              <h2 style={{ color: '#16a34a', margin: 0, fontSize: '2.25rem', fontWeight: 800 }}>{stats.totalPresent}</h2>
            </div>
            <div style={cardStyle}>
              <span style={{ color: '#6b7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Attendance Rate</span>
              <h2 style={{ color: stats.averageAttendanceRate >= 50 ? '#16a34a' : '#dc2626', margin: 0, fontSize: '2.25rem', fontWeight: 800 }}>
                {stats.averageAttendanceRate}%
              </h2>
            </div>
          </div>

          {/* Summary Box */}
          <div style={{ ...cardStyle, padding: '2rem' }}>
            <h2 style={{ color: '#002f63', margin: '0 0 0.75rem 0', fontSize: '1.25rem', fontWeight: 700 }}>Attendance Summary & Performance</h2>
            <p style={{ color: '#4b5563', margin: 0, fontSize: '0.9rem', lineHeight: '1.6' }}>
              Out of <strong>{stats.totalStudents}</strong> registered students,{' '}
              <strong>{stats.totalPresent}</strong> attendance sign-ins have been recorded for{' '}
              <strong>{rangePreset === 'today' ? 'today' : rangePreset === 'week' ? 'the last 7 days' : rangePreset === 'month' ? 'this month' : 'all recorded meetings'}</strong>,
              representing an overall attendance rate of{' '}
              <strong style={{ color: stats.averageAttendanceRate >= 50 ? '#16a34a' : '#dc2626' }}>{stats.averageAttendanceRate}%</strong>.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
