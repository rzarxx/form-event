import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const events = await prisma.event.findMany({
      where: { userId: session.user.id },
      include: {
        tickets: {
          select: {
            id: true,
            name: true,
            price: true,
            quota: true,
            sold: true,
          },
        },
        _count: {
          select: { transactions: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Compute aggregated stats for each event
    const eventsWithStats = events.map((event) => {
      const ticketCount = event.tickets.length;
      const totalSold = event.tickets.reduce((sum, t) => sum + t.sold, 0);
      const totalQuota = event.tickets.reduce((sum, t) => sum + t.quota, 0);

      return {
        ...event,
        ticketCount,
        totalSold,
        totalQuota,
        transactionCount: event._count.transactions,
      };
    });

    return NextResponse.json(eventsWithStats);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data event: " + String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description } = body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Judul event wajib diisi" },
        { status: 400 }
      );
    }

    // Check Free Tier Limitation
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (user?.role === "PANITIA" && !user.referredByCode) {
      const settings = await prisma.systemSetting.findUnique({ where: { id: "GLOBAL" } });
      const maxEvents = settings?.freeMaxEvents ?? 1;
      
      const currentEvents = await prisma.event.count({ where: { userId: session.user.id } });
      if (currentEvents >= maxEvents) {
        return NextResponse.json(
          { error: `Batas akun gratis tercapai (Maksimal ${maxEvents} event). Hubungi Admin untuk upgrade.` },
          { status: 403 }
        );
      }
    }

    const event = await prisma.event.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        userId: session.user.id,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal membuat event: " + String(error) },
      { status: 500 }
    );
  }
}
