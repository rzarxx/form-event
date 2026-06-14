import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardShell from "./dashboard-shell";

import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role === "PANITIA" && session.user.isPhoneVerified === false) {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (user && !user.isPhoneVerified) {
      if (user.phone) {
        redirect(`/register/verify?phone=${user.phone}`);
      } else {
        // Fallback for old accounts
        redirect(`/register`);
      }
    }
  }

  return <DashboardShell session={session}>{children}</DashboardShell>;
}
