import { NextResponse } from "next/server";
import prisma from '@/lib/db';
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import bcrypt from "bcryptjs";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (!hasPermission(user.role, "users:view")) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        centreId: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("[USERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (!hasPermission(user.role, "users:create")) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const body = await req.json();
    const { fullName, email, password, role, centreId } = body;

    if (!fullName || !email || !password || !role) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return new NextResponse("User already exists", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        role,
        centreId
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
      }
    });

    await logAudit({ userId: user.userId, action: 'CREATED_USER', entity: 'System', entityId: newUser.id });

    return NextResponse.json(newUser);
  } catch (error) {
    console.error("[USERS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
