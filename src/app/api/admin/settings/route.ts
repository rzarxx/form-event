import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Upsert: fetch existing or create with defaults
  const settings = await prisma.systemSetting.upsert({
    where: { id: "GLOBAL" },
    update: {},
    create: {
      id: "GLOBAL",
      platformFee: 0,
      freeQuotaLimit: 150,
      freeMaxEvents: 1,
      freeMaxTicketsPerEvent: 3,
      freeCustomFormEnabled: false,
      proPlanPrice: 99000,
    },
  });

  return Response.json(settings);
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { 
      platformFee, 
      freeQuotaLimit,
      freeMaxEvents,
      freeMaxTicketsPerEvent,
      freeCustomFormEnabled,
      proPlanPrice
    } = body;

    const updateData: Record<string, unknown> = {};

    if (platformFee !== undefined) {
      const fee = Number(platformFee);
      if (isNaN(fee) || fee < 0) {
        return Response.json(
          { error: "Platform fee harus berupa angka positif" },
          { status: 400 }
        );
      }
      updateData.platformFee = fee;
    }

    if (freeQuotaLimit !== undefined) {
      const quota = Number(freeQuotaLimit);
      if (isNaN(quota) || quota < 0 || !Number.isInteger(quota)) {
        return Response.json(
          { error: "Free quota limit harus berupa bilangan bulat positif" },
          { status: 400 }
        );
      }
      updateData.freeQuotaLimit = quota;
    }

    if (freeMaxEvents !== undefined) {
      updateData.freeMaxEvents = Number(freeMaxEvents);
    }
    if (freeMaxTicketsPerEvent !== undefined) {
      updateData.freeMaxTicketsPerEvent = Number(freeMaxTicketsPerEvent);
    }
    if (freeCustomFormEnabled !== undefined) {
      updateData.freeCustomFormEnabled = Boolean(freeCustomFormEnabled);
    }
    if (proPlanPrice !== undefined) {
      updateData.proPlanPrice = Number(proPlanPrice);
    }

    const settings = await prisma.systemSetting.update({
      where: { id: "GLOBAL" },
      data: updateData,
    });

    return Response.json(settings);
  } catch (error) {
    console.error("Error updating settings:", error);
    return Response.json(
      { error: "Gagal memperbarui pengaturan" },
      { status: 500 }
    );
  }
}
