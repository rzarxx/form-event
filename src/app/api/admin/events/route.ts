import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const events = await prisma.event.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true, email: true },
        },
        _count: {
          select: { tickets: true, transactions: true },
        },
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Failed to fetch all events:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
