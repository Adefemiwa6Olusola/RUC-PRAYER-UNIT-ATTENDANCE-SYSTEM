import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://ruc-prayerunit.vercel.app'),
  title: {
    default: "RUC Prayer Unit | Official Attendance & Portal System",
    template: "%s | RUC Prayer Unit",
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
    icon: '/ruc-logo.png',
    shortcut: '/ruc-logo.png',
    apple: '/ruc-logo.png',
  },
  openGraph: {
    title: "RUC Prayer Unit | Official Attendance & Portal System",
    description: "Official Redeemer's University (RUN) Prayer Unit Attendance Management System. Track prayer unit sign-ins, statistics, and member records.",
    url: 'https://ruc-prayerunit.vercel.app',
    siteName: 'RUC Prayer Unit',
    images: [
      {
        url: '/ruc-logo.png',
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
    images: ['/ruc-logo.png'],
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
  // Google Rich Snippet Structured Data (JSON-LD) for organic ranking
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'RUC Prayer Unit',
    alternateName: ["Redeemer's University Prayer Unit", "RUN Prayer Unit", "RUC Prayer Unit Attendance"],
    url: 'https://ruc-prayerunit.vercel.app',
    logo: 'https://ruc-prayerunit.vercel.app/ruc-logo.png',
    description: "Official RUC Prayer Unit Attendance System for Redeemer's University Chapel of Power.",
    sameAs: [],
  };

  return (
    <html lang="en">
      <head>
        <meta name="google-site-verification" content="NgPp9fCiQ5GMM9dyglMc5xYKZnjSyQkG2IuHQEpKnBw" />
        <link rel="icon" href="/ruc-logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/ruc-logo.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
