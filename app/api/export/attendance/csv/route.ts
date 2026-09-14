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
    if (!hasPermission(user.role, "attendance:export")) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const centreId = searchParams.get('centreId');

    const where: any = {};
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to + 'T23:59:59');
    }
    if (centreId) {
      where.session = { centreId };
    }

    const attendances = await prisma.attendanceRecord.findMany({
      where,
      include: {
        student: true,
        session: {
          include: {
            centre: true,
            meeting: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    let csvContent = "Date,Day of Week,Student Name,Matric Number,Suffix,Centre,Status,Exact Check-in Time\n";

    attendances.forEach((record) => {
      const recordDate = new Date(record.checkInAt || record.createdAt);
      const dateStr = recordDate.toISOString().split('T')[0];
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = days[recordDate.getDay()];
      const isSunday = recordDate.getDay() === 0;
      const dayLabel = isSunday ? `${dayName} [SUNDAY SERVICE]` : dayName;

      const name = `"${record.student.fullName.replace(/"/g, '""')}"`;
      const matric = record.student.matricNo;
      const suffix = record.student.matricSuffix;
      const centre = `"${(record.session?.centre?.name || "General").replace(/"/g, '""')}"`;
      const status = record.status;
      const timeIn = recordDate.toLocaleTimeString('en-US', { hour12: true });

      csvContent += `${dateStr},${dayLabel},${name},${matric},${suffix},${centre},${status},${timeIn}\n`;
    });

    await logAudit({ 
      userId: user.userId, 
      action: 'EXPORTED_ATTENDANCE_CSV', 
      entity: 'System', 
      entityId: "Exported attendance records to CSV" 
    });

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="ruc-attendance-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("[EXPORT_CSV_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
