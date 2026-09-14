import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { normalizeMatricNo, extractMatricSuffix, isValidName } from '@/lib/validation';
import { logAudit } from '@/lib/audit';
import { StudentStatus } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, 'students:view')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '500');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') as StudentStatus | null;

    const where: any = {};
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { matricNo: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) {
      where.status = status;
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const skip = (page - 1) * limit;
    const [students, total, todayRecords] = await Promise.all([
      prisma.student.findMany({
        where,
        skip,
        take: limit,
        orderBy: { fullName: 'asc' },
        select: {
          id: true,
          fullName: true,
          matricNo: true,
          matricSuffix: true,
          faculty: true,
          department: true,
          level: true,
          phone: true,
          email: true,
          image: true,
          status: true,
          createdAt: true,
        }
      }),
      prisma.student.count({ where }),
      prisma.attendanceRecord.findMany({
        where: { checkInAt: { gte: todayStart } },
        select: { studentId: true }
      })
    ]);

    const presentStudentIds = new Set(todayRecords.map(r => r.studentId));

    const formattedStudents = students.map(student => ({
      ...student,
      todayStatus: presentStudentIds.has(student.id) ? 'PRESENT' : 'ABSENT',
      isPresentToday: presentStudentIds.has(student.id)
    }));

    return NextResponse.json({ students: formattedStudents, total, page, limit });
  } catch (error) {
    console.error('Error in GET /api/students:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, 'students:create')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = await req.json();
    if (!isValidName(data.fullName)) {
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
    }

    const matricNo = normalizeMatricNo(data.matricNo);
    if (!matricNo) {
      return NextResponse.json({ error: 'Invalid matric number' }, { status: 400 });
    }

    const existing = await prisma.student.findUnique({ where: { matricNo } });
    if (existing) {
      return NextResponse.json({ error: 'Student with matric number already exists' }, { status: 400 });
    }

    const matricSuffix = extractMatricSuffix(matricNo);

    const student = await prisma.student.create({
      data: {
        fullName: data.fullName,
        matricNo,
        matricSuffix,
        faculty: data.faculty || null,
        department: data.department || null,
        level: data.level || null,
        phone: data.phone || null,
        email: data.email || null,
        gender: data.gender || null,
        birthday: data.birthday || null,
        hostel: data.hostel || null,
        blockNumber: data.blockNumber || null,
        roomNumber: data.roomNumber || null,
        image: data.image || null,
        status: data.status || 'ACTIVE'
      }
    });

    logAudit({
      userId: user.userId,
      action: 'CREATE',
      entity: 'Student',
      entityId: student.id,
      metadata: { matricNo: student.matricNo }
    }).catch(err => console.error(err));

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
