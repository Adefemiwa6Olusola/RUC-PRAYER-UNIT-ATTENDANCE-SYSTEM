import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, 'attendance:mark')) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const centreId = searchParams.get('centreId');

    const where: any = {};

    if (from || to) {
      where.checkInAt = {};
      if (from) {
        const fromDate = new Date(from);
        fromDate.setHours(0, 0, 0, 0);
        where.checkInAt.gte = fromDate;
      }
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        where.checkInAt.lte = toDate;
      }
    }

    if (centreId) {
      where.session = { centreId };
    }

    const skip = (page - 1) * limit;

    const [total, records] = await Promise.all([
      prisma.attendanceRecord.count({ where }),
      prisma.attendanceRecord.findMany({
        where,
        take: limit,
        skip,
        orderBy: { checkInAt: 'desc' },
        include: {
          session: {
            include: {
              meeting: true,
              centre: true,
            },
          },
          student: true,
        },
      }),
    ]);

    return NextResponse.json({
      data: records,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching attendance history:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
