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
    let { sessionId, studentId, status = 'PRESENT' } = body;

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
    }

    // Auto-resolve valid session if sessionId is missing or dummy 'auto-session'
    let session: any = null;
    if (sessionId && sessionId !== 'auto-session') {
      session = await prisma.attendanceSession.findUnique({ where: { id: sessionId } });
    }

    if (!session) {
      // Find open session or create one
      session = await prisma.attendanceSession.findFirst({
        where: { status: 'OPEN' },
        orderBy: { startedAt: 'desc' }
      });
    }

    if (!session) {
      let defaultCentre = await prisma.centre.findFirst();
      if (!defaultCentre) {
        defaultCentre = await prisma.centre.create({
          data: { name: 'Chapel', description: 'Main Chapel Centre' }
        });
      }

      let defaultMeeting = await prisma.meeting.findFirst({
        where: { centreId: defaultCentre.id }
      });

      if (!defaultMeeting) {
        defaultMeeting = await prisma.meeting.create({
          data: {
            title: 'Daily Prayer Service',
            description: 'General prayer meeting',
            meetingDate: new Date(),
            centreId: defaultCentre.id,
            createdById: user.userId
          }
        });
      }

      session = await prisma.attendanceSession.create({
        data: {
          meetingId: defaultMeeting.id,
          centreId: defaultCentre.id,
          status: 'OPEN',
          startedAt: new Date(),
          startedById: user.userId
        }
      });
    }

    sessionId = session.id;

    // Direct check for duplicate record for this student and session
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
