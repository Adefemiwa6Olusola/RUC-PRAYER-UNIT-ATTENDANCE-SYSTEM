import { NextResponse } from 'next/server';
import { removeAuthCookie, getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (user) {
      await logAudit({
        userId: user.userId,
        action: 'LOGOUT',
        entity: 'User',
        entityId: user.userId,
      });
    }
    await removeAuthCookie();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
