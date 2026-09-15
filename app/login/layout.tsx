import { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Login | RUC Prayer Unit Attendance System",
  description: "Official Login Portal for Redeemer's University RUC Prayer Unit Attendance Management System.",
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <main>{children}</main>
    </>
  );
}
