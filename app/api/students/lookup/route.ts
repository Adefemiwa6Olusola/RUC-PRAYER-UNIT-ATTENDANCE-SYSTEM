import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const suffix = searchParams.get('suffix')?.trim() || '';
    if (!suffix) {
      return NextResponse.json([], { status: 200 });
    }

    // 1. Ultra-fast exact index lookup first
    let students = await prisma.student.findMany({
      where: {
        OR: [
          { matricSuffix: suffix },
          { matricNo: suffix }
        ],
        status: 'ACTIVE'
      },
      select: { id: true, fullName: true, matricNo: true, matricSuffix: true }
    });

    // 2. Fallback search if exact suffix not matched
    if (students.length === 0) {
      students = await prisma.student.findMany({
        where: {
          matricNo: { contains: suffix, mode: 'insensitive' },
          status: 'ACTIVE'
        },
        take: 5,
        select: { id: true, fullName: true, matricNo: true, matricSuffix: true }
      });
    }

    return NextResponse.json(students);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
