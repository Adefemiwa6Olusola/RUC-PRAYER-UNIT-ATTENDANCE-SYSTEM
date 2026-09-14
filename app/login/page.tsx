'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '@/components/layout/Footer';

const EXACT_SIX_CENTRES = [
  { id: 'Chapel', name: 'Chapel' },
  { id: 'Sapetro', name: 'Sapetro' },
  { id: 'Event Center', name: 'Event Center' },
  { id: 'Beyond Expectation', name: 'Beyond Expectation' },
  { id: '3-In-1', name: '3-In-1' },
  { id: 'LR', name: 'LR' }
];

export default function LoginPage() {
  const router = useRouter();
  const [centre, setCentre] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotCentre, setForgotCentre] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState({ type: '', text: '' });
  const [isSendingReset, setIsSendingReset] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!centre) { setError('Please select your attendance centre'); return; }
    if (!password) { setError('Please enter your password'); return; }
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@ruc.edu', password, centreId: centre, centreName: centre }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push('/attendance');
      } else {
        setError(data.error || 'Invalid credentials or centre selection');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMsg({ type: '', text: '' });
    if (!forgotEmail) { setForgotMsg({ type: 'error', text: 'Please enter your email address' }); return; }
    setIsSendingReset(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, centreId: forgotCentre }),
      });
      if (res.ok) {
        setForgotMsg({ type: 'success', text: 'Instructions sent! Check your email inbox.' });
      } else {
        const data = await res.json();
        setForgotMsg({ type: 'error', text: data.error || 'Failed to send reset link' });
      }
    } catch (e) {
      setForgotMsg({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      {/* Top Header Bar */}
      <header style={{ backgroundColor: '#002f63', padding: '0.85rem 0', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src="/ruc-logo.png" alt="RUC Logo" width={36} height={36} style={{ borderRadius: '50%', backgroundColor: 'white', padding: '2px', objectFit: 'contain' }} />
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.2, fontStyle: 'italic' }}>RUC Prayer Unit</div>
            <div style={{ color: '#93c5fd', fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.04em' }}>Attendance System</div>
          </div>
        </div>
      </header>

      {/* Login Card */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2.5rem 1rem' }}>
        <div style={{
          width: '100%', maxWidth: '26rem', backgroundColor: 'white',
          borderRadius: '1rem', padding: '2.5rem 2rem', boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
          border: '1px solid #f0f0f0',
        }}>
          {/* Lock Icon Circle */}
          <div style={{
            width: '3.5rem', height: '3.5rem', borderRadius: '50%', backgroundColor: '#002f63',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.75rem',
            boxShadow: '0 4px 12px rgba(0,47,99,0.2)',
          }}>
            <svg width="22" height="22" fill="none" stroke="white" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <form onSubmit={handleLogin}>
            {error && (
              <div style={{ padding: '0.65rem', borderRadius: '0.5rem', backgroundColor: '#fef2f2', color: '#b91c1c', fontSize: '0.8rem', fontWeight: 600, textAlign: 'center', marginBottom: '1rem', border: '1px solid #fecaca' }}>
                {error}
              </div>
            )}

            {/* Instant Centre Dropdown (0ms Latency, 6 Options) */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#002f63', marginBottom: '0.4rem' }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                Centre
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={centre}
                  onChange={e => setCentre(e.target.value)}
                  style={{
                    width: '100%', padding: '0.75rem 2.5rem 0.75rem 0.75rem', borderRadius: '0.5rem',
                    border: '1px solid #d1d5db', fontSize: '0.875rem', fontWeight: 500,
                    backgroundColor: 'white', appearance: 'none', outline: 'none', cursor: 'pointer',
                  }}
                >
                  <option value="" disabled>Select your centre</option>
                  {EXACT_SIX_CENTRES.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
                <div style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9ca3af', fontSize: '0.7rem' }}>▼</div>
              </div>
            </div>

            {/* Password Input */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#002f63', marginBottom: '0.4rem' }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  style={{
                    width: '100%', padding: '0.75rem', paddingRight: '2.5rem', borderRadius: '0.5rem',
                    border: '1px solid #d1d5db', fontSize: '0.875rem', outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '0.25rem' }}
                >
                  {showPassword ? (
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 1l22 22" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%', padding: '0.85rem', backgroundColor: '#002f63', color: 'white',
                fontWeight: 700, fontSize: '0.95rem', borderRadius: '0.5rem', border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '0.5rem', opacity: isLoading ? 0.7 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              {isLoading ? 'Authenticating...' : 'Login'}
            </button>

            {/* Forgot Password */}
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={() => { setIsForgotModalOpen(true); setForgotMsg({ type: '', text: '' }); }}
                style={{ background: 'none', border: 'none', color: '#002f63', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Forgot your password?
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: '26rem', boxShadow: '0 20px 50px rgba(0,0,0,0.15)' }}>
            <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '50%', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', border: '1px solid #dbeafe' }}>
              <svg width="22" height="22" fill="none" stroke="#1e40af" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <h3 style={{ textAlign: 'center', fontWeight: 700, fontSize: '1.15rem', marginBottom: '0.25rem' }}>Reset Password</h3>
            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#6b7280', marginBottom: '1rem' }}>
              Enter your email address and we'll send you instructions to reset your password.
            </p>

            {forgotMsg.text && (
              <div style={{
                padding: '0.6rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 600, textAlign: 'center', marginBottom: '0.75rem',
                backgroundColor: forgotMsg.type === 'error' ? '#fef2f2' : '#f0fdf4',
                color: forgotMsg.type === 'error' ? '#b91c1c' : '#15803d',
                border: `1px solid ${forgotMsg.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
              }}>
                {forgotMsg.text}
              </div>
            )}

            <form onSubmit={handleForgotSubmit}>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#374151', marginBottom: '0.25rem' }}>Centre</label>
                <select
                  value={forgotCentre}
                  onChange={e => setForgotCentre(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', fontSize: '0.8rem', backgroundColor: 'white', outline: 'none', cursor: 'pointer' }}
                >
                  {EXACT_SIX_CENTRES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#374151', marginBottom: '0.25rem' }}>Email Address</label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', fontSize: '0.8rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid #f3f4f6' }}>
                <button type="button" onClick={() => setIsForgotModalOpen(false)} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 600, border: '1px solid #d1d5db', backgroundColor: 'white', cursor: 'pointer', color: '#374151' }}>
                  Cancel
                </button>
                <button type="submit" disabled={isSendingReset} style={{ padding: '0.5rem 1.25rem', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 700, backgroundColor: '#002f63', color: 'white', border: 'none', cursor: 'pointer', opacity: isSendingReset ? 0.7 : 1 }}>
                  {isSendingReset ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
