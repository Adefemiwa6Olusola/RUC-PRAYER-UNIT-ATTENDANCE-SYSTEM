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
    
    if (!hasPermission(user.role, 'centres:view')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const centre = await prisma.centre.findUnique({
      where: { id: params.id }
    });

    if (!centre) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }

    return NextResponse.json(centre);
  } catch (error) {
    console.error('Error fetching centre:', error);
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
    
    if (!hasPermission(user.role, 'centres:edit')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    
    if (!body.name || body.name.trim() === '') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const centre = await prisma.centre.update({
      where: { id: params.id },
      data: {
        name: body.name.trim(),
        description: body.description,
        isActive: body.isActive
      }
    });

    await logAudit({ userId: user.userId, action: 'UPDATE_CENTRE', entity: 'System', entityId: params.id });

    return NextResponse.json(centre);
  } catch (error) {
    console.error('Error updating centre:', error);
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
    
    if (!hasPermission(user.role, 'centres:delete')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.centre.delete({
      where: { id: params.id }
    });

    await logAudit({ userId: user.userId, action: 'DELETE_CENTRE', entity: 'System', entityId: params.id });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting centre:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
