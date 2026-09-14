'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>({ name: 'Admin', role: 'admin', centreName: 'Chapel' });

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f9fafb' }}>
      <Header user={user} currentPath={pathname} />

      <main style={{ flex: 1, maxWidth: '1280px', margin: '0 auto', padding: '1.5rem', width: '100%' }}>
        {children}
      </main>

      <Footer />
    </div>
  );
}
