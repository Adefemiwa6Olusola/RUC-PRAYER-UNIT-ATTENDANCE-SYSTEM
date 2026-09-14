import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { logAudit } from '@/lib/audit';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    if (!hasPermission(user.role, 'meetings:view')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const meeting = await prisma.meeting.findUnique({
      where: { id: params.id }
    });

    if (!meeting) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }

    return NextResponse.json(meeting);
  } catch (error) {
    console.error('Error fetching meeting:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    if (!hasPermission(user.role, 'meetings:edit')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    
    if (!body.title || !body.meetingDate || !body.centreId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const meeting = await prisma.meeting.update({
      where: { id: params.id },
      data: {
        title: body.title,
        description: body.description || null,
        meetingDate: new Date(body.meetingDate),
        startTime: body.startTime || null,
        endTime: body.endTime || null,
        centreId: body.centreId,
        prayerUnitId: body.prayerUnitId || null,
        isRecurring: body.isRecurring || false,
      }
    });

    await logAudit({ userId: user.userId, action: 'UPDATE_MEETING', entity: 'System', entityId: params.id });

    return NextResponse.json(meeting);
  } catch (error) {
    console.error('Error updating meeting:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    if (!hasPermission(user.role, 'meetings:delete')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.meeting.delete({
      where: { id: params.id }
    });

    await logAudit({ userId: user.userId, action: 'DELETE_MEETING', entity: 'System', entityId: params.id });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting meeting:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
