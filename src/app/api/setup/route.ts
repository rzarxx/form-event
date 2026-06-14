import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    // Cek apakah sudah ada super admin
    const existingAdmin = await prisma.user.findFirst({
      where: { role: "SUPER_ADMIN" },
    });

    if (existingAdmin) {
      return NextResponse.json({ message: "Sistem sudah diinisialisasi. Super Admin sudah ada." });
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);
    
    await prisma.user.create({
      data: {
        name: "Super Admin",
        email: "admin@rezzdev.my.id",
        password: hashedPassword,
        role: "SUPER_ADMIN",
      },
    });

    return NextResponse.json({ 
      message: "Sukses! Akun Super Admin berhasil dibuat.",
      credentials: {
        email: "admin@rezzdev.my.id",
        password: "admin123"
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Gagal membuat admin: " + String(error) }, { status: 500 });
  }
}
