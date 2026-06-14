import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const totalUsers = await prisma.user.count({
      where: { role: { not: "SUPER_ADMIN" } }
    });

    const totalEvents = await prisma.event.count();

    const successTx = await prisma.transaction.findMany({
      where: { paymentStatus: "SUCCESS" },
      include: { ticket: true }
    });

    const totalRevenue = successTx.reduce(
      (sum, tx) => sum + Number(tx.ticket.price),
      0
    );

    return NextResponse.json({ totalUsers, totalEvents, totalRevenue });
  } catch (error) {
    console.error("Failed to fetch admin stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
