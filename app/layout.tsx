import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://ruc-prayerunit.vercel.app'),
  title: {
    default: "RUC Prayer Unit | Official Attendance & Portal System",
    template: "%s | RUC Prayer Unit",
  },
  applicationName: "RUC Prayer Unit",
  appleWebApp: {
    title: "RUC Prayer Unit",
  },
  description: "Official Redeemer's University (RUN) Prayer Unit Attendance Portal. Mark prayer meeting attendance, view statistics, manage student roster, and track unit participation across all centres.",
  keywords: [
    "RUC Prayer Unit",
    "RUC Prayer Unit Attendance",
    "Redeemer's University Prayer Unit",
    "RUN Prayer Unit",
    "RUC Prayer Unit Portal",
    "RUC Attendance System",
    "Redeemer's University Chapel Prayer Unit",
    "RUC Prayer Unit Sign In",
    "RUN Prayer Unit Attendance",
    "Chapel of Power Prayer Unit"
  ],
  authors: [{ name: "RUC Prayer Unit Team" }],
  creator: "RUC Prayer Unit",
  publisher: "Redeemer's University Chapel",
  verification: {
    google: 'NgPp9fCiQ5GMM9dyglMc5xYKZnjSyQkG2IuHQEpKnBw',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: 'https://ruc-prayerunit.vercel.app',
  },
  icons: {
    icon: [
      { url: 'https://ruc-prayerunit.vercel.app/favicon.ico', sizes: 'any' },
      { url: 'https://ruc-prayerunit.vercel.app/favicon-48x48.png', type: 'image/png', sizes: '48x48' },
      { url: 'https://ruc-prayerunit.vercel.app/icon-192x192.png', type: 'image/png', sizes: '192x192' },
    ],
    shortcut: 'https://ruc-prayerunit.vercel.app/favicon.ico',
    apple: 'https://ruc-prayerunit.vercel.app/apple-touch-icon.png',
  },
  manifest: 'https://ruc-prayerunit.vercel.app/site.webmanifest',
  openGraph: {
    title: "RUC Prayer Unit | Official Attendance & Portal System",
    description: "Official Redeemer's University (RUN) Prayer Unit Attendance Management System. Track prayer unit sign-ins, statistics, and member records.",
    url: 'https://ruc-prayerunit.vercel.app',
    siteName: 'RUC Prayer Unit',
    images: [
      {
        url: 'https://ruc-prayerunit.vercel.app/ruc-logo.png',
        width: 500,
        height: 500,
        alt: 'RUC Prayer Unit Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "RUC Prayer Unit | Official Attendance & Portal System",
    description: "Official Redeemer's University (RUN) Prayer Unit Attendance Management System.",
    images: ['https://ruc-prayerunit.vercel.app/ruc-logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Google Search Site Name & Rich Snippet Structured Data (JSON-LD)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://ruc-prayerunit.vercel.app/#website',
        url: 'https://ruc-prayerunit.vercel.app/',
        name: 'RUC Prayer Unit',
        alternateName: ["Redeemer's University Prayer Unit", "RUN Prayer Unit", "RUC Prayer Unit Attendance"],
        publisher: {
          '@type': 'Organization',
          name: "Redeemer's University Chapel",
          logo: 'https://ruc-prayerunit.vercel.app/ruc-logo.png',
        },
      },
      {
        '@type': 'EducationalOrganization',
        '@id': 'https://ruc-prayerunit.vercel.app/#organization',
        name: 'RUC Prayer Unit',
        url: 'https://ruc-prayerunit.vercel.app/',
        logo: 'https://ruc-prayerunit.vercel.app/ruc-logo.png',
        description: "Official RUC Prayer Unit Attendance System for Redeemer's University Chapel of Power.",
      },
    ],
  };

  return (
    <html lang="en">
      <head>
        <meta name="google-site-verification" content="NgPp9fCiQ5GMM9dyglMc5xYKZnjSyQkG2IuHQEpKnBw" />
        <meta name="application-name" content="RUC Prayer Unit" />
        <meta name="apple-mobile-web-app-title" content="RUC Prayer Unit" />
        <link rel="icon" href="https://ruc-prayerunit.vercel.app/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="48x48" href="https://ruc-prayerunit.vercel.app/favicon-48x48.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="https://ruc-prayerunit.vercel.app/icon-96x96.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="https://ruc-prayerunit.vercel.app/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="https://ruc-prayerunit.vercel.app/apple-touch-icon.png" />
        <link rel="manifest" href="https://ruc-prayerunit.vercel.app/site.webmanifest" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
