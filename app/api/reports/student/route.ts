import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, 'reports:view')) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return new NextResponse('Student ID required', { status: 400 });
    }

    const records = await prisma.attendanceRecord.findMany({
      where: { studentId },
      include: { session: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(records);
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
}
