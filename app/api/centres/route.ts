import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { logAudit } from '@/lib/audit';

const ALLOWED_CENTRES = [
  'Chapel',
  'Sapetro',
  'Event Center',
  'Beyond Expectation',
  '3-In-1',
  'LR'
];

export async function GET(request: Request) {
  try {
    const centres = await prisma.centre.findMany({
      where: {
        name: { in: ALLOWED_CENTRES },
        isActive: true
      },
      orderBy: { name: 'asc' }
    });

    // Ensure order matches ALLOWED_CENTRES array exactly
    const sortedCentres = ALLOWED_CENTRES.map(name => {
      const found = centres.find(c => c.name === name);
      return found || { id: name.toLowerCase().replace(/[^a-z0-9]/g, ''), name };
    });

    return NextResponse.json(sortedCentres);
  } catch (error) {
    console.error('Error fetching centres:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    if (!hasPermission(user.role, 'centres:create')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    
    if (!body.name || body.name.trim() === '') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const centre = await prisma.centre.create({ 
      data: {
        name: body.name.trim(),
        description: body.description || null,
        isActive: body.isActive ?? true
      } 
    });
    
    await logAudit({ userId: user.userId, action: 'CREATE_CENTRE', entity: 'System', entityId: centre.id });

    return NextResponse.json(centre, { status: 201 });
  } catch (error) {
    console.error('Error creating centre:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
