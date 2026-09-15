import { NextResponse } from 'next/server';

export async function GET() {
  return new NextResponse('google-site-verification: google22f7b05948bfa609.html', {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
