import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/auth/me', '/api/users', '/admin/private/'],
    },
    sitemap: 'https://ruc-prayerunit.vercel.app/sitemap.xml',
  };
}
