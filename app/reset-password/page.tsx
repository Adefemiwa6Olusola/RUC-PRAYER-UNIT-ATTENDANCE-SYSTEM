'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      if (res.ok) {
        setMessage('Password reset successful. Redirecting to login...');
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setMessage('Error resetting password');
      }
    } catch (err) {
      setMessage('Network error');
    }
  };

  return (
    <div className="card" style={{ maxWidth: '28rem', width: '100%', padding: '2rem' }}>
      <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>
      
      {message && <div className="mb-4 text-center text-sm font-bold">{message}</div>}
      
      {!token ? (
        <div className="text-red-600 text-center">Invalid or missing token.</div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input type="password" className="input" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary btn-full" style={{ backgroundColor: '#002f63', color: 'white' }}>Reset Password</button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#002f63', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <Suspense fallback={<div className="text-white text-center">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
