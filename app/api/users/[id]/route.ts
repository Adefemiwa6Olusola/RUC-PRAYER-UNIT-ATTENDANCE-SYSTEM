import { NextResponse } from "next/server";
import prisma from '@/lib/db';
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import bcrypt from "bcryptjs";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (!hasPermission(user.role, "users:edit")) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const body = await req.json();
    const { fullName, email, password, role, centreId, isActive } = body;

    const dataToUpdate: any = {};
    if (fullName !== undefined) dataToUpdate.fullName = fullName;
    if (email !== undefined) dataToUpdate.email = email;
    if (role !== undefined) dataToUpdate.role = role;
    if (centreId !== undefined) dataToUpdate.centreId = centreId;
    if (isActive !== undefined) dataToUpdate.isActive = isActive;

    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    const oldUser = await prisma.user.findUnique({ where: { id: params.id } });

    const updatedUser = await prisma.user.update({
      where: {
        id: params.id,
      },
      data: dataToUpdate,
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
      }
    });

    await logAudit({ userId: user.userId, action: 'UPDATED_USER', entity: 'System', entityId: updatedUser.id });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("[USER_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (!hasPermission(user.role, "users:delete")) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const oldUser = await prisma.user.findUnique({ where: { id: params.id } });
    if (!oldUser) {
        return new NextResponse("Not Found", { status: 404 });
    }

    const deletedUser = await prisma.user.delete({
      where: {
        id: params.id,
      },
    });

    await logAudit({ userId: user.userId, action: 'DELETED_USER', entity: 'System', entityId: deletedUser.id });

    return NextResponse.json(deletedUser);
  } catch (error) {
    console.error("[USER_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
