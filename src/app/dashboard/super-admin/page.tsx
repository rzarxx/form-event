"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalEvents: number;
  totalRevenue: number;
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const statCards = [
    { 
      label: "Total Pengguna", 
      value: stats?.totalUsers?.toLocaleString("id-ID") || "0", 
      growth: "N/A" 
    },
    { 
      label: "Total Event", 
      value: stats?.totalEvents?.toLocaleString("id-ID") || "0", 
      growth: "N/A" 
    },
    { 
      label: "Total Pendapatan", 
      value: formatRupiah(stats?.totalRevenue || 0), 
      growth: "N/A" 
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat Cards */}
        {statCards.map((stat, i) => (
          <div key={i} className="p-6 rounded-xl bg-white ring-1 ring-gray-950/5 shadow-sm">
            <p className="text-gray-500 text-sm font-medium mb-1">{stat.label}</p>
            <div className="h-10 flex items-center mt-1">
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              ) : (
                <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
              )}
            </div>
            <span className="text-gray-400 text-xs font-semibold mt-2 inline-block">
              {stat.growth}
            </span>
          </div>
        ))}
      </div>

      <div className="p-6 rounded-xl bg-white ring-1 ring-gray-950/5 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Aktivitas Terbaru</h3>
        <div className="text-center text-gray-500 py-12">
          Belum ada aktivitas yang tercatat.
        </div>
      </div>
    </div>
  );
}
