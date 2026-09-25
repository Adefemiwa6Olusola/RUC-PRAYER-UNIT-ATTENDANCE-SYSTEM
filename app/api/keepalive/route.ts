import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Ping Supabase PostgreSQL database to keep connection warm
    const studentCount = await prisma.student.count();
    const sessionCount = await prisma.attendanceSession.count();

    return NextResponse.json({
      status: 'active',
      database: 'connected (Supabase Cloud PostgreSQL)',
      timestamp: new Date().toISOString(),
      studentCount,
      sessionCount,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error?.message || 'Database keepalive failed' },
      { status: 500 }
    );
  }
}
