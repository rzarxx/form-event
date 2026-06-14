"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, Users, Ticket, Settings, LogOut, QrCode } from "lucide-react";

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

interface DashboardShellProps {
  session: {
    user?: {
      name?: string | null;
      email?: string | null;
      role?: string;
    };
  };
  children: React.ReactNode;
}

export default function DashboardShell({ session, children }: DashboardShellProps) {
  const pathname = usePathname();
  const role = session?.user?.role;

  const superAdminLinks = [
    { name: "Overview", href: "/dashboard/super-admin", icon: LayoutDashboard },
    { name: "Kelola Pengguna", href: "/dashboard/super-admin/users", icon: Users },
    { name: "Pengaturan Sistem", href: "/dashboard/super-admin/settings", icon: Settings },
  ];

  const panitiaLinks = [
    { name: "Dashboard", href: "/dashboard/panitia", icon: LayoutDashboard },
    { name: "Event Saya", href: "/dashboard/panitia/events", icon: Ticket },
    { name: "Akun Scanner", href: "/dashboard/panitia/scanners", icon: Users },
  ];

  const scannerLinks = [
    { name: "Scan Tiket", href: "/dashboard/scanner", icon: QrCode },
  ];

  const links =
    role === "SUPER_ADMIN" ? superAdminLinks : role === "PANITIA" ? panitiaLinks : role === "SCANNER" ? scannerLinks : [];

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden text-slate-50">
      {/* Sidebar - Glassmorphism */}
      <aside className="w-64 flex-shrink-0 flex flex-col backdrop-blur-2xl bg-slate-900/40 border-r border-slate-800 relative z-20">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800/50">
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-emerald-400">
            CampusTicketing
          </span>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
              {session?.user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold truncate w-36">{session?.user?.name || "User"}</span>
              <span className="text-xs text-slate-400 font-medium truncate w-36">{role}</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 text-sm font-medium group",
                  isActive
                    ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-inner"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300")} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 mt-auto border-t border-slate-800/50">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors group"
          >
            <LogOut className="h-5 w-5 text-slate-500 group-hover:text-red-400" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative flex flex-col min-w-0 overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/10 blur-[150px] pointer-events-none" />

        {/* Topbar */}
        <header className="h-16 flex-shrink-0 backdrop-blur-md border-b border-slate-800/30 flex items-center px-8 z-10">
          <h2 className="text-lg font-semibold text-slate-200 capitalize">
            {pathname.split("/").pop()?.replace(/-/g, " ") || "Dashboard"}
          </h2>
        </header>

        <div className="flex-1 overflow-y-auto p-8 z-10 relative">
          {children}
        </div>
      </main>
    </div>
  );
}
