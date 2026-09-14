import { ReactNode } from 'react';
import { Header } from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <main>{children}</main>
    </>
  );
}
