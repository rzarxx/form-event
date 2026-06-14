import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardRoot() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role;

  switch (role) {
    case "SUPER_ADMIN":
      redirect("/dashboard/super-admin");
    case "PANITIA":
      redirect("/dashboard/panitia");
    case "SCANNER":
      redirect("/dashboard/scanner");
    default:
      redirect("/login");
  }
}
