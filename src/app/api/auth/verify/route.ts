import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { phone, otp } = await req.json();

    if (!phone || !otp) {
      return NextResponse.json(
        { error: "Nomor telepon dan OTP harus diisi" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    if (user.otpCode !== otp) {
      return NextResponse.json({ error: "Kode OTP tidak valid" }, { status: 400 });
    }

    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return NextResponse.json(
        { error: "Kode OTP sudah kedaluwarsa" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isPhoneVerified: true,
        otpCode: null,
        otpExpiry: null,
      },
    });

    return NextResponse.json(
      { message: "Verifikasi nomor telepon berhasil" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verify Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
