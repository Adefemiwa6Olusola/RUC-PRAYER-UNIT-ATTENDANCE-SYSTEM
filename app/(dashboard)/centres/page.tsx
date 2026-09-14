'use client';
import { useState, useEffect } from 'react';

export default function CentresPage() {
  const [centres, setCentres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', status: 'ACTIVE' });

  useEffect(() => {
    fetchCentres();
  }, []);

  const fetchCentres = async () => {
    try {
      const res = await fetch('/api/centres?all=true');
      if (res.ok) setCentres(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/centres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ name: '', status: 'ACTIVE' });
        fetchCentres();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const cardStyle = { background: 'white', border: '1px solid #f0f0f0', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
  const inputStyle = { width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #ccc', marginBottom: '1rem', boxSizing: 'border-box' as const };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: '#002f63', margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>Centres</h1>
        <button 
          onClick={() => setShowModal(true)}
          style={{ background: '#002f63', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', fontWeight: '500', cursor: 'pointer' }}
        >
          Add Centre
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {centres.map((c, i) => (
            <div key={i} style={cardStyle}>
              <h3 style={{ color: '#002f63', margin: 0 }}>{c.name}</h3>
              <span style={{ 
                padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 'bold',
                backgroundColor: c.status === 'ACTIVE' ? '#dcfce7' : '#fee2e2',
                color: c.status === 'ACTIVE' ? '#16a34a' : '#dc2626'
              }}>
                {c.status || 'ACTIVE'}
              </span>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '0.75rem', width: '100%', maxWidth: '400px' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', color: '#002f63' }}>Add New Centre</h2>
            <form onSubmit={handleAddSubmit}>
              <input style={inputStyle} type="text" placeholder="Centre Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <select style={inputStyle} required value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '0.5rem 1rem', background: '#f3f4f6', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.5rem 1rem', background: '#002f63', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>Save Centre</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
