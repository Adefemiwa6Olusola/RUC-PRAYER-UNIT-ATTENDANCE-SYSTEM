import { NextResponse } from "next/server";
import prisma from '@/lib/db';
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (!hasPermission(user.role, "audit:view")) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 100;

    const logs = await prisma.auditLog.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
            select: {
                fullName: true,
                email: true
            }
        }
      }
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("[AUDIT_LOGS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
