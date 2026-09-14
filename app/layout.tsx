import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RUC Prayer Unit - Attendance Management System',
  description: "Redeemer's University Chapel of Power Prayer Unit Attendance Management System",
  keywords: ['RUC', 'Prayer Unit', 'Attendance', 'Redeemers University', 'Chapel of Power'],
  icons: {
    icon: '/ruc-logo.png',
    shortcut: '/ruc-logo.png',
    apple: '/ruc-logo.png',
  },
  openGraph: {
    title: 'RUC Prayer Unit - Attendance Management System',
    description: "Redeemer's University Chapel of Power Prayer Unit Attendance Management System",
    images: [
      {
        url: '/ruc-logo.png',
        width: 500,
        height: 500,
        alt: 'RUC Logo',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'RUC Prayer Unit - Attendance Management System',
    description: "Redeemer's University Chapel of Power Prayer Unit Attendance Management System",
    images: ['/ruc-logo.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/ruc-logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/ruc-logo.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
