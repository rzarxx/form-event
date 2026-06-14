import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { NextRequest } from "next/server";

export async function PUT(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/users/[id]">
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await ctx.params;
    const body = await request.json();
    const { name, email, role, password } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) {
      const validRoles = ["SUPER_ADMIN", "PANITIA", "MITRA", "SCANNER"];
      if (!validRoles.includes(role)) {
        return Response.json({ error: "Role tidak valid" }, { status: 400 });
      }
      updateData.role = role;
    }
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return Response.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return Response.json(
      { error: "Gagal memperbarui pengguna" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/users/[id]">
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await ctx.params;

    // Prevent self-deletion
    if (id === session.user.id) {
      return Response.json(
        { error: "Tidak dapat menghapus akun sendiri" },
        { status: 400 }
      );
    }

    await prisma.user.delete({ where: { id } });

    return Response.json({ message: "Pengguna berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return Response.json(
      { error: "Gagal menghapus pengguna" },
      { status: 500 }
    );
  }
}
