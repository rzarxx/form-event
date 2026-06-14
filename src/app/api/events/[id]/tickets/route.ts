import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const tickets = await prisma.ticket.findMany({
      where: { eventId: id },
      orderBy: { price: "asc" },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil tiket: " + String(error) },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify event ownership
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) {
      return NextResponse.json({ error: "Event tidak ditemukan" }, { status: 404 });
    }
    if (event.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, price, quota } = body;

    if (!name || typeof price !== "number" || typeof quota !== "number") {
      return NextResponse.json(
        { error: "Data tiket tidak valid" },
        { status: 400 }
      );
    }

    // Check Free Tier Limitation
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (user?.role === "PANITIA" && !user.referredByCode) {
      const settings = await prisma.systemSetting.findUnique({ where: { id: "GLOBAL" } });
      const maxTickets = settings?.freeMaxTicketsPerEvent ?? 3;
      
      const currentTickets = await prisma.ticket.count({ where: { eventId: id } });
      if (currentTickets >= maxTickets) {
        return NextResponse.json(
          { error: `Batas akun gratis tercapai (Maksimal ${maxTickets} tipe tiket per event). Hubungi Admin untuk upgrade.` },
          { status: 403 }
        );
      }
    }

    const newTicket = await prisma.ticket.create({
      data: {
        eventId: id,
        name: name.trim(),
        price,
        quota,
        sold: 0,
      },
    });

    return NextResponse.json(newTicket, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal membuat tiket: " + String(error) },
      { status: 500 }
    );
  }
}
