import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { logAudit } from '@/lib/audit';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    if (!hasPermission(user.role, 'attendance:start')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    let { meetingId, centreId } = body;

    if (!centreId) {
      const defaultCentre = await prisma.centre.findFirst();
      if (!defaultCentre) return NextResponse.json({ error: 'No centre found' }, { status: 400 });
      centreId = defaultCentre.id;
    }

    // Find or create valid meeting for this centre
    let meeting: any = null;

    if (meetingId && meetingId !== 'general-session') {
      meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
    }

    if (!meeting) {
      meeting = await prisma.meeting.findFirst({
        where: { centreId }
      });
    }

    if (!meeting) {
      meeting = await prisma.meeting.create({
        data: {
          title: 'Daily Prayer Service',
          description: 'General daily prayer session',
          meetingDate: new Date(),
          centreId: centreId,
          createdById: user.userId
        }
      });
    }

    meetingId = meeting.id;

    // Check for an existing OPEN session for this meeting and centre
    let session = await prisma.attendanceSession.findFirst({
      where: { 
        centreId,
        status: 'OPEN'
      },
      include: {
        meeting: true,
        centre: true
      }
    });

    if (!session) {
      session = await prisma.attendanceSession.create({
        data: {
          meetingId,
          centreId,
          status: 'OPEN',
          startedAt: new Date(),
          startedById: user.userId
        },
        include: {
          meeting: true,
          centre: true
        }
      });

      await logAudit({ 
        userId: user.userId, 
        action: 'START_SESSION', 
        entity: 'AttendanceSession', 
        entityId: session.id 
      });
    }

    return NextResponse.json({ 
      message: 'Attendance session active', 
      session 
    }, { status: 200 });
  } catch (error) {
    console.error('Error starting attendance session:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
