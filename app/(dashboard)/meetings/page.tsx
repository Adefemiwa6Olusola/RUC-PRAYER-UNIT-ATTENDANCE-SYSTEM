'use client';
import { useState, useEffect } from 'react';

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [centres, setCentres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', date: '', startTime: '', endTime: '', centreId: '' });

  useEffect(() => {
    fetchMeetings();
    fetchCentres();
  }, []);

  const fetchMeetings = async () => {
    try {
      const res = await fetch('/api/meetings');
      if (res.ok) setMeetings(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCentres = async () => {
    try {
      const res = await fetch('/api/centres');
      if (res.ok) setCentres(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ title: '', date: '', startTime: '', endTime: '', centreId: '' });
        fetchMeetings();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const inputStyle = { width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #ccc', marginBottom: '1rem', boxSizing: 'border-box' as const };
  const cardStyle = { background: 'white', border: '1px solid #f0f0f0', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '1.5rem' };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: '#002f63', margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>Meetings & Programmes</h1>
        <button 
          onClick={() => setShowModal(true)}
          style={{ background: '#002f63', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', fontWeight: '500', cursor: 'pointer' }}
        >
          Add Meeting
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {meetings.map((m, i) => (
            <div key={i} style={cardStyle}>
              <h3 style={{ color: '#002f63', margin: '0 0 0.5rem 0' }}>{m.title}</h3>
              <p style={{ margin: '0 0 0.25rem 0', color: '#666' }}><strong>Date:</strong> {new Date(m.date).toLocaleDateString()}</p>
              <p style={{ margin: '0 0 0.25rem 0', color: '#666' }}><strong>Time:</strong> {m.startTime} - {m.endTime}</p>
              <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}><strong>Centre:</strong> {m.centre?.name || 'N/A'}</p>
              <span style={{ 
                padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 'bold',
                backgroundColor: m.status === 'ACTIVE' ? '#dcfce7' : '#f3f4f6',
                color: m.status === 'ACTIVE' ? '#16a34a' : '#4b5563'
              }}>
                {m.status || 'SCHEDULED'}
              </span>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '0.75rem', width: '100%', maxWidth: '500px' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', color: '#002f63' }}>Add New Meeting</h2>
            <form onSubmit={handleAddSubmit}>
              <input style={inputStyle} type="text" placeholder="Title" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              <input style={inputStyle} type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input style={inputStyle} type="time" required value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
                <input style={inputStyle} type="time" required value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} />
              </div>
              <select style={inputStyle} required value={formData.centreId} onChange={e => setFormData({...formData, centreId: e.target.value})}>
                <option value="">Select Centre</option>
                {centres.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '0.5rem 1rem', background: '#f3f4f6', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.5rem 1rem', background: '#002f63', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>Save Meeting</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
