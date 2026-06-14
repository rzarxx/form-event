import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendWhatsappMessage } from "@/lib/mpwa";

export async function POST(req: Request) {
  try {
    const { name, email, phone, password } = await req.json();

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { error: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email atau nomor telepon sudah terdaftar" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: "PANITIA",
        isPhoneVerified: false,
        otpCode,
        otpExpiry,
      },
    });

    const message = `Halo ${name},\n\nKode OTP Anda untuk pendaftaran CampusTicketing adalah *${otpCode}*. Kode ini berlaku selama 10 menit.\n\nJangan berikan kode ini kepada siapapun.`;
    await sendWhatsappMessage(phone, message);

    return NextResponse.json(
      { message: "Registrasi berhasil, OTP telah dikirim ke WhatsApp" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
