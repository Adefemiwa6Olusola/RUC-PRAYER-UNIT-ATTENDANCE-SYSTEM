import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-change-me');

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const publicPaths = [
    '/',
    '/login',
    '/reset-password',
    '/api/auth/login',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/centres',
    '/api/keepalive',
    '/_next',
    '/favicon.ico',
    '/icon.png',
    '/apple-touch-icon.png',
    '/ruc-logo.png',
    '/site.webmanifest',
    '/sitemap.xml',
    '/robots.txt',
    '/google22f7b05948bfa609.html'
  ];

  const isPublic = publicPaths.some(p => pathname === p || pathname.startsWith(p + '/'));

  if (isPublic) {
    return NextResponse.next();
  }

  const token = request.cookies.get('ruc-prayer-token')?.value;

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    await jwtVerify(token, JWT_SECRET);
    return NextResponse.next();
  } catch (error) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('ruc-prayer-token');
    return response;
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|icon\\.png|apple-touch-icon\\.png|ruc-logo\\.png|site\\.webmanifest|google22f7b05948bfa609\\.html|sitemap\\.xml|robots\\.txt).*)'
  ],
};
