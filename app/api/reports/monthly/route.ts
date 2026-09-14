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
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    
    if (!month || !year) {
        return new NextResponse('Missing month or year', { status: 400 });
    }

    const targetDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const nextDate = new Date(parseInt(year), parseInt(month), 1);

    const report = await prisma.attendanceSession.findMany({
      where: {
        meeting: {
            meetingDate: {
              gte: targetDate,
              lt: nextDate,
            }
        }
      },
      include: { 
          attendanceRecords: true,
          meeting: true,
          centre: true
      },
    });

    return NextResponse.json(report);
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
}
