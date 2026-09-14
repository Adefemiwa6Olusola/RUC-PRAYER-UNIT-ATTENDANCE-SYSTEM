import { NextResponse } from "next/server";
import prisma from '@/lib/db';
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (!hasPermission(user.role, "reports:view")) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    
    const whereClause: any = {};
    if (startDate && endDate) {
        whereClause.meetingDate = {
            gte: new Date(startDate),
            lte: new Date(endDate),
        };
    }

    const meetings = await prisma.meeting.findMany({
        where: whereClause,
        include: {
            attendanceSessions: {
                include: {
                    attendanceRecords: {
                        include: {
                            student: true
                        }
                    }
                }
            }
        }
    });

    const centreStats = await prisma.centre.findMany({
        include: {
            attendanceSessions: {
                include: {
                    attendanceRecords: true
                }
            }
        }
    });

    await logAudit({ userId: user.userId, action: 'VIEWED_CENTRE_REPORTS', entity: 'System', entityId: "Viewed centre attendance reports" });

    return NextResponse.json({ meetings, centreStats });
  } catch (error) {
    console.error("[CENTRE_REPORTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
