import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { logAudit } from '@/lib/audit';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    if (!hasPermission(user.role, 'meetings:view')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const centreId = searchParams.get('centreId');

    const meetings = await prisma.meeting.findMany({
      where: centreId ? { centreId } : undefined,
      include: { centre: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(meetings);
  } catch (error) {
    console.error('Error fetching meetings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    if (!hasPermission(user.role, 'meetings:create')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    
    if (!body.title || !body.meetingDate || !body.centreId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const meeting = await prisma.meeting.create({ 
      data: {
        title: body.title,
        description: body.description || null,
        meetingDate: new Date(body.meetingDate),
        startTime: body.startTime || null,
        endTime: body.endTime || null,
        centreId: body.centreId,
        prayerUnitId: body.prayerUnitId || null,
        isRecurring: body.isRecurring || false,
        createdById: user.userId
      }
    });
    
    await logAudit({ userId: user.userId, action: 'CREATE_MEETING', entity: 'System', entityId: meeting.id });

    return NextResponse.json(meeting, { status: 201 });
  } catch (error) {
    console.error('Error creating meeting:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
