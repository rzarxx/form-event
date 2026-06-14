"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, Users, Ticket, Settings, LogOut, QrCode, Menu, ChevronLeft } from "lucide-react";

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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const superAdminLinks = [
    { name: "Overview", href: "/dashboard/super-admin", icon: LayoutDashboard },
    { name: "Semua Event", href: "/dashboard/super-admin/events", icon: Ticket },
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
    <div className="flex h-screen bg-gray-50 overflow-hidden text-gray-900">
      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 md:hidden" 
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "flex-shrink-0 flex flex-col bg-white border-r border-gray-200 relative z-50 transition-all duration-300 absolute md:relative h-full",
          isCollapsed ? "w-20" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Toggle Button for Desktop */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute -right-3 top-6 bg-white hover:bg-gray-50 border border-gray-200 text-gray-500 hover:text-gray-900 p-1 rounded-full z-50 transition-colors shadow-sm"
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
        </button>

        {/* Logo */}
        <div className={cn("h-16 flex items-center border-b border-gray-200 transition-all overflow-hidden", isCollapsed ? "px-0 justify-center" : "px-6")}>
          <span className="text-xl font-bold text-gray-900 whitespace-nowrap">
            {isCollapsed ? "CT" : "CampusTicketing"}
          </span>
        </div>

        {/* User Info */}
        <div className={cn("p-6 border-b border-gray-200 transition-all", isCollapsed && "p-4 flex justify-center")}>
          <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-3")}>
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 shrink-0 ring-1 ring-inset ring-indigo-700/10">
              {session?.user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-semibold text-gray-900 truncate w-36">{session?.user?.name || "User"}</span>
                <span className="text-xs text-gray-500 font-medium truncate w-36">{role}</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto overflow-x-hidden">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.name}
                href={link.href}
                title={isCollapsed ? link.name : undefined}
                className={cn(
                  "flex items-center gap-3 py-2.5 rounded-lg transition-all duration-300 text-sm font-medium group whitespace-nowrap",
                  isCollapsed ? "px-0 justify-center" : "px-3",
                  isActive
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-500")} />
                {!isCollapsed && <span>{link.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 mt-auto border-t border-gray-200">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title={isCollapsed ? "Keluar" : undefined}
            className={cn(
              "flex items-center gap-3 py-2.5 w-full rounded-lg text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors group",
              isCollapsed ? "px-0 justify-center" : "px-3"
            )}
          >
            <LogOut className="h-5 w-5 shrink-0 text-gray-400 group-hover:text-red-600" />
            {!isCollapsed && <span>Keluar</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative flex flex-col min-w-0 overflow-hidden bg-gray-50">
        {/* Topbar */}
        <header className="h-16 flex-shrink-0 bg-white border-b border-gray-200 flex items-center px-4 md:px-8 z-10 gap-4 shadow-sm">
          <button 
            className="md:hidden text-gray-500 hover:text-gray-900"
            onClick={() => setIsMobileOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900 capitalize">
            {pathname.split("/").pop()?.replace(/-/g, " ") || "Dashboard"}
          </h2>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 z-10 relative">
          {children}
        </div>
      </main>
    </div>
  );
}
