'use client';
import { useState, useEffect } from 'react';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [centres, setCentres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'MEMBER', centreId: '', status: 'ACTIVE' });

  useEffect(() => {
    fetchUsers();
    fetchCentres();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) setUsers(await res.json());
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
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ name: '', email: '', role: 'MEMBER', centreId: '', status: 'ACTIVE' });
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getRoleBadge = (role: string) => {
    let bg = '#f3f4f6', color = '#4b5563';
    if (role === 'SUPER_ADMIN') { bg = '#fee2e2'; color = '#dc2626'; }
    if (role === 'EXCO') { bg = '#e0f2fe'; color = '#0284c7'; }
    if (role === 'MEMBER') { bg = '#dcfce7'; color = '#16a34a'; }
    return (
      <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: bg, color: color }}>
        {role}
      </span>
    );
  };

  const thStyle = { textAlign: 'left' as const, padding: '1rem', borderBottom: '2px solid #f0f0f0', color: '#002f63', fontWeight: 'bold' };
  const tdStyle = { padding: '1rem', borderBottom: '1px solid #f0f0f0', color: '#333' };
  const inputStyle = { width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #ccc', marginBottom: '1rem', boxSizing: 'border-box' as const };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: '#002f63', margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>User Management</h1>
        <button 
          onClick={() => setShowModal(true)}
          style={{ background: '#002f63', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', fontWeight: '500', cursor: 'pointer' }}
        >
          Add User
        </button>
      </div>

      <div style={{ background: 'white', border: '1px solid #f0f0f0', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Role</th>
              <th style={thStyle}>Centre</th>
              <th style={thStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No users found</td></tr>
            ) : (
              users.map((u, i) => (
                <tr key={i}>
                  <td style={tdStyle}><strong>{u.name}</strong></td>
                  <td style={tdStyle}>{u.email}</td>
                  <td style={tdStyle}>{getRoleBadge(u.role)}</td>
                  <td style={tdStyle}>{u.centre?.name || 'N/A'}</td>
                  <td style={tdStyle}>
                    <span style={{ color: u.status === 'ACTIVE' ? '#16a34a' : '#dc2626', fontWeight: 'bold' }}>{u.status}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '0.75rem', width: '100%', maxWidth: '500px' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', color: '#002f63' }}>Add New User</h2>
            <form onSubmit={handleAddSubmit}>
              <input style={inputStyle} type="text" placeholder="Full Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input style={inputStyle} type="email" placeholder="Email Address" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              
              <select style={inputStyle} required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                <option value="MEMBER">Member</option>
                <option value="EXCO">Exco</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
              
              <select style={inputStyle} required value={formData.centreId} onChange={e => setFormData({...formData, centreId: e.target.value})}>
                <option value="">Select Centre</option>
                {centres.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '0.5rem 1rem', background: '#f3f4f6', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.5rem 1rem', background: '#002f63', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>Save User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
