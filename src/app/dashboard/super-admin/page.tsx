"use client";

import { useEffect, useState } from "react";
import { Loader2, Users, Receipt, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

interface AdminStats {
  totalUsers: number;
  totalEvents: number;
  totalRevenue: number;
}

interface ChartData {
  name: string;
  date: string;
  revenue: number;
  users: number;
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, chartRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/stats/chart")
        ]);

        if (statsRes.ok) {
          setStats(await statsRes.json());
        }
        
        if (chartRes.ok) {
          const chartJson = await chartRes.json();
          setChartData(chartJson.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
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
      icon: Users,
      color: "bg-blue-50 text-blue-600"
    },
    { 
      label: "Total Event", 
      value: stats?.totalEvents?.toLocaleString("id-ID") || "0", 
      icon: TrendingUp,
      color: "bg-emerald-50 text-emerald-600"
    },
    { 
      label: "Total Pendapatan", 
      value: formatRupiah(stats?.totalRevenue || 0), 
      icon: Receipt,
      color: "bg-indigo-50 text-indigo-600"
    },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard HQ</h1>
        <p className="text-gray-500 mt-1">Ringkasan statistik dan metrik platform secara realtime.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            key={i} 
            className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-4">
              <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            
            <div className="h-10 flex items-center">
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              ) : (
                <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{stat.value}</h3>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm"
      >
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900">Statistik Pendapatan (7 Hari Terakhir)</h3>
          <p className="text-sm text-gray-500">Total pendapatan dari penjualan tiket dan upgrade paket Pro.</p>
        </div>

        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickFormatter={(val) => `Rp ${val.toLocaleString('id-ID')}`}
                />
                <Tooltip 
                  formatter={(value: any) => [`Rp ${Number(value).toLocaleString('id-ID')}`, 'Pendapatan']}
                  labelStyle={{ color: '#111827', fontWeight: 600 }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#4f46e5" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
