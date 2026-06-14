import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: { events: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(users);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { email, password, name, role } = body;

    if (!email || !password || !role) {
      return Response.json(
        { error: "Email, password, dan role wajib diisi" },
        { status: 400 }
      );
    }

    const validRoles = ["SUPER_ADMIN", "PANITIA", "MITRA", "SCANNER"];
    if (!validRoles.includes(role)) {
      return Response.json({ error: "Role tidak valid" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return Response.json(
        { error: "Email sudah terdaftar" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        role,
      },
    });

    return Response.json(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return Response.json(
      { error: "Gagal membuat pengguna" },
      { status: 500 }
    );
  }
}
