import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { normalizeMatricNo, extractMatricSuffix } from '@/lib/validation';
import { logAudit } from '@/lib/audit';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        attendanceRecords: {
          include: {
            session: { include: { meeting: true } }
          },
          orderBy: { checkInAt: 'desc' },
          take: 50
        }
      }
    });
    if (!student) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(student);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const data = await req.json();

    const updateData: any = {
      fullName: data.fullName,
      faculty: data.faculty,
      department: data.department,
      level: data.level,
      phone: data.phone,
      email: data.email,
      gender: data.gender,
      birthday: data.birthday,
      hostel: data.hostel,
      blockNumber: data.blockNumber,
      roomNumber: data.roomNumber,
      image: data.image,
      status: data.status || 'ACTIVE',
    };

    if (data.matricNo) {
      const matricNo = normalizeMatricNo(data.matricNo);
      if (!matricNo) return NextResponse.json({ error: 'Invalid matric number' }, { status: 400 });
      updateData.matricNo = matricNo;
      updateData.matricSuffix = extractMatricSuffix(matricNo);
    }

    const student = await prisma.student.update({
      where: { id },
      data: updateData
    });

    logAudit({
      userId: user.userId,
      action: 'UPDATE',
      entity: 'Student',
      entityId: id,
    }).catch(() => {});

    return NextResponse.json(student);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;

    // 1. Delete associated attendance records first to satisfy foreign key constraints
    await prisma.attendanceRecord.deleteMany({
      where: { studentId: id }
    });

    // 2. Delete student record completely from database
    await prisma.student.delete({
      where: { id }
    });

    logAudit({
      userId: user.userId,
      action: 'DELETE',
      entity: 'Student',
      entityId: id,
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting student:', error);
    return NextResponse.json({ error: 'Failed to remove student profile' }, { status: 500 });
  }
}
