import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { logAudit } from '@/lib/audit';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!hasPermission(user.role, 'attendance:mark')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { sessionId, studentId, status = 'PRESENT' } = body;

    if (!sessionId || !studentId) {
      return NextResponse.json({ error: 'Session ID and Student ID are required' }, { status: 400 });
    }

    // Direct check for duplicate record for this student and session (or today)
    const existing = await prisma.attendanceRecord.findFirst({
      where: { studentId, sessionId },
      include: { student: { select: { fullName: true, matricNo: true } } }
    });

    if (existing) {
      return NextResponse.json({
        error: "You've already marked attendance here today.",
        status: "duplicate",
        student: existing.student
      }, { status: 409 });
    }

    // Create attendance record instantly
    const attendanceRecord = await prisma.attendanceRecord.create({
      data: {
        sessionId,
        studentId,
        status,
        recordedById: user.userId,
        checkInAt: new Date()
      },
      include: {
        student: {
          select: { id: true, fullName: true, matricNo: true }
        }
      }
    });

    // Log audit asynchronously (non-blocking)
    logAudit({
      userId: user.userId,
      action: 'MARK_ATTENDANCE',
      entity: 'AttendanceRecord',
      entityId: attendanceRecord.id
    }).catch(err => console.error('Audit log error:', err));

    return NextResponse.json({
      status: 'success',
      record: attendanceRecord,
      student: attendanceRecord.student,
      checkInTime: attendanceRecord.checkInAt
    }, { status: 201 });

  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({
        error: "You've already marked attendance here today.",
        status: "duplicate"
      }, { status: 409 });
    }
    console.error('Error marking attendance:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
