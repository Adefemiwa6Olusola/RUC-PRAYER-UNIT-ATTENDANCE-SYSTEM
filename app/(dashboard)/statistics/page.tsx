'use client';

import { useState, useEffect } from 'react';

export default function StatisticsPage() {
  const [stats, setStats] = useState({ totalStudents: 0, totalPresent: 0, averageAttendanceRate: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError('');
      try {
        const date = new Date().toISOString().split('T')[0];
        const [reportsRes, studentsRes] = await Promise.all([
          fetch(`/api/reports/daily?date=${date}`).catch(() => null),
          fetch('/api/students?limit=500').catch(() => null)
        ]);

        let studentCount = 0;
        if (studentsRes && studentsRes.ok) {
          const sData = await studentsRes.json();
          studentCount = sData.total || (Array.isArray(sData.students) ? sData.students.length : 0);
        }

        let presentCount = 0;
        if (reportsRes && reportsRes.ok) {
          const rData = await reportsRes.json();
          if (Array.isArray(rData)) {
            rData.forEach(session => {
              if (session.attendanceRecords) {
                presentCount += session.attendanceRecords.filter((r: any) => r.status === 'PRESENT').length;
              }
            });
          } else if (rData && typeof rData.totalPresent === 'number') {
            presentCount = rData.totalPresent;
          }
        }

        const rate = studentCount > 0 ? Math.round((presentCount / studentCount) * 10000) / 100 : 0;

        setStats({
          totalStudents: studentCount,
          totalPresent: presentCount,
          averageAttendanceRate: rate
        });
      } catch (err: any) {
        setError(err.message || 'An error occurred loading statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#002f63', margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Attendance Statistics</h1>
        <p style={{ color: '#6b7280', margin: '0.25rem 0 0 0', fontSize: '0.8rem' }}>Real-time analytical overview of member attendance performance</p>
      </div>

      {loading ? (
        <div style={{ color: '#002f63', padding: '3rem', textAlign: 'center' }}>Loading attendance metrics...</div>
      ) : error ? (
        <div style={{ color: '#dc2626', background: '#fee2e2', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.85rem' }}>{error}</div>
      ) : (
        <>
          {/* Stat Cards Grid (3 Cards: Total Students, Total Present Today, Attendance Rate) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={cardStyle}>
              <span style={{ color: '#6b7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Total Students</span>
              <h2 style={{ color: '#002f63', margin: 0, fontSize: '2.25rem', fontWeight: 800 }}>{stats.totalStudents}</h2>
            </div>
            <div style={cardStyle}>
              <span style={{ color: '#6b7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Total Present Today</span>
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
              <strong>{stats.totalPresent}</strong> student sign-ins have been recorded today, representing a current overall attendance rate of{' '}
              <strong style={{ color: stats.averageAttendanceRate >= 50 ? '#16a34a' : '#dc2626' }}>{stats.averageAttendanceRate}%</strong>.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
