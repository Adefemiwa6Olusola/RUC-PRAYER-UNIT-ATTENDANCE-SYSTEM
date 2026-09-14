import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, 'students:view')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!q) {
      return NextResponse.json({ students: [], total: 0 });
    }

    const skip = (page - 1) * limit;
    const where = {
      OR: [
        { fullName: { contains: q, mode: 'insensitive' as any } },
        { matricNo: { contains: q, mode: 'insensitive' as any } }
      ]
    };

    const [students, total] = await Promise.all([
      prisma.student.findMany({ where, skip, take: limit, orderBy: { fullName: 'asc' } }),
      prisma.student.count({ where })
    ]);

    return NextResponse.json({ students, total, page, limit });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
