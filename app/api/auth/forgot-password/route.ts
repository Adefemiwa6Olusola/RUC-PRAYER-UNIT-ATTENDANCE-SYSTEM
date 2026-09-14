import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { generateResetToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const token = generateResetToken();
      await prisma.passwordReset.create({
        data: {
          userId: user.id,
          token,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        }
      });
      if (process.env.NODE_ENV === 'development') {
        console.log(`Reset token for ${email}: ${token}`);
      }
    }
    // Always return success
    return NextResponse.json({ success: true, message: 'If an account exists, a reset link has been created.' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
