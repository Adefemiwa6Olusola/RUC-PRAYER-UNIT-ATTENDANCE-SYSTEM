'use client';

import Link from 'next/link';
import { useState } from 'react';

export function Header({ user, currentPath }: { user: any; currentPath: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch (e) {}
    window.location.href = '/login';
  };

  const navItems = [
    { label: 'Sign In', path: '/attendance', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Statistics', path: '/statistics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { label: 'Students', path: '/students', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { label: 'Attendance', path: '/attendance/history', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  ];

  const centreName = user?.centreName || user?.centre?.name || 'General';

  return (
    <>
      <header style={{
        backgroundColor: '#002f63',
        padding: '0',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0.75rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          {/* Left: Logo + Title */}
          <Link href="/attendance" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
            <img
              src="/ruc-logo.png"
              alt="RUC Logo"
              width={40}
              height={40}
              style={{ borderRadius: '50%', backgroundColor: 'white', padding: '2px', objectFit: 'contain' }}
            />
            <div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem', lineHeight: '1.2', fontStyle: 'italic' }}>
                RUC Prayer Unit
              </div>
              <div style={{ color: '#FFD700', fontSize: '0.7rem', fontWeight: 400 }}>
                {centreName}
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="desktop-nav">
            {navItems.map((item) => {
              const isActive = currentPath === item.path || 
                (item.path === '/attendance' && currentPath === '/attendance') ||
                (item.path === '/attendance/history' && currentPath?.startsWith('/attendance/history'));
              
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.5rem 0.85rem',
                    borderRadius: '9999px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    backgroundColor: isActive ? '#FFD700' : 'transparent',
                    color: isActive ? '#002f63' : 'white',
                  }}
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: '#dc2626',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                marginLeft: '0.5rem',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#b91c1c')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#dc2626')}
            >
              Logout
            </button>
          </nav>

          {/* Mobile Hamburger */}
          <button
            className="mobile-hamburger"
            onClick={() => setMobileOpen(true)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'white',
              fontSize: '1.5rem',
            }}
          >
            ☰
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <>
          <div
            onClick={() => setMobileOpen(false)}
            style={{
              position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 50, animation: 'fadeIn 0.2s ease',
            }}
          />
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: '16rem',
            backgroundColor: 'white', zIndex: 60, padding: '1.5rem',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
          }}>
            <button
              onClick={() => setMobileOpen(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              ✕
            </button>
            <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {navItems.map((item) => {
                const isActive = currentPath === item.path || 
                  (item.path === '/attendance' && currentPath === '/attendance');
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.75rem 0.5rem', borderBottom: '1px solid #e5e7eb',
                      fontWeight: 500, textDecoration: 'none',
                      color: isActive ? '#002f63' : '#374151',
                      backgroundColor: isActive ? '#eff6ff' : 'transparent',
                      borderRadius: '0.5rem',
                    }}
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                    {item.label}
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                style={{
                  marginTop: '1rem', backgroundColor: '#dc2626', color: 'white',
                  padding: '0.75rem', borderRadius: '0.5rem', fontWeight: 600,
                  border: 'none', cursor: 'pointer', width: '100%',
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </>
      )}

      <style jsx global>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-hamburger { display: block !important; }
        }
      `}</style>
    </>
  );
}
