import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, 'reports:view')) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    let fromDate = dateParam ? new Date(dateParam) : fromParam ? new Date(fromParam) : new Date();
    fromDate.setHours(0, 0, 0, 0);

    let toDate = toParam ? new Date(toParam) : new Date(fromDate);
    toDate.setHours(23, 59, 59, 999);

    const [totalStudents, totalPresent, records] = await Promise.all([
      prisma.student.count(),
      prisma.attendanceRecord.count({
        where: {
          checkInAt: {
            gte: fromDate,
            lte: toDate,
          }
        }
      }),
      prisma.attendanceRecord.findMany({
        where: {
          checkInAt: {
            gte: fromDate,
            lte: toDate,
          }
        },
        include: {
          student: true,
          session: {
            include: { centre: true, meeting: true }
          }
        },
        orderBy: { checkInAt: 'desc' }
      })
    ]);

    const attendanceRate = totalStudents > 0 ? Math.round((totalPresent / totalStudents) * 10000) / 100 : 0;

    return NextResponse.json({
      date: fromDate.toISOString().split('T')[0],
      totalStudents,
      totalPresent,
      attendanceRate,
      records
    });
  } catch (error) {
    console.error('Error in daily report API:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
