import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const scanner = await prisma.user.findUnique({
      where: { id },
    });

    if (!scanner) {
      return NextResponse.json(
        { error: "Scanner tidak ditemukan" },
        { status: 404 }
      );
    }

    if (scanner.role !== "SCANNER" || scanner.panitiaId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ message: "Scanner berhasil dihapus" });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal menghapus scanner: " + String(error) },
      { status: 500 }
    );
  }
}
