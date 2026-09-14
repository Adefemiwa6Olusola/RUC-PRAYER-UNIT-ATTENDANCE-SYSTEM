import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { logAudit } from '@/lib/audit';


export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return new NextResponse('Unauthorized', { status: 401 });

    const session = await prisma.attendanceSession.findUnique({
      where: { id: params.id },
      include: { attendanceRecords: true },
    });

    if (!session) return new NextResponse('Not found', { status: 404 });
    return NextResponse.json(session);
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, 'attendance:edit')) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const validatedData = body;

    const updatedSession = await prisma.attendanceSession.update({
      where: { id: params.id },
      data: validatedData,
    });

    await logAudit({ userId: user.userId, action: 'UPDATE_SESSION', entity: 'System', entityId: params.id });
    return NextResponse.json(updatedSession);
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, 'attendance:delete')) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await prisma.attendanceSession.delete({
      where: { id: params.id },
    });

    await logAudit({ userId: user.userId, action: 'DELETE_SESSION', entity: 'System', entityId: params.id });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
}
