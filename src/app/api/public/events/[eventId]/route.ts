import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { tickets: true },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const systemSetting = await prisma.systemSetting.findUnique({
      where: { id: "GLOBAL" },
    });
    const platformFee = systemSetting?.platformFee ? Number(systemSetting.platformFee) : 0;

    return NextResponse.json({ ...event, platformFee });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}
