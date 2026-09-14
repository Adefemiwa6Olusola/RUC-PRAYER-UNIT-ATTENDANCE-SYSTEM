import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const activeCentreName = user.centreName || user.centreId || 'Chapel';

    return NextResponse.json({
      user: {
        id: user.userId,
        email: user.email,
        fullName: user.fullName || 'Admin User',
        role: user.role || 'SUPER_ADMIN',
        centreName: activeCentreName,
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
