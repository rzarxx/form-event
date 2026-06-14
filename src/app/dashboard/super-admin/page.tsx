import { auth } from "@/auth";

export default async function SuperAdminDashboard() {
  const session = await auth();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat Cards */}
        {[
          { label: "Total Pengguna", value: "1,245", growth: "+12%" },
          { label: "Total Event Aktif", value: "48", growth: "+4%" },
          { label: "Pendapatan Bulan Ini", value: "Rp 12.500.000", growth: "+24%" },
        ].map((stat, i) => (
          <div key={i} className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[50px] group-hover:bg-indigo-500/20 transition-colors" />
            <p className="text-slate-400 text-sm font-medium mb-1">{stat.label}</p>
            <h3 className="text-3xl font-bold text-slate-100">{stat.value}</h3>
            <span className="text-emerald-400 text-xs font-semibold mt-2 inline-block">
              {stat.growth} vs bulan lalu
            </span>
          </div>
        ))}
      </div>

      <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
        <h3 className="text-lg font-semibold mb-4">Aktivitas Terbaru</h3>
        <div className="text-center text-slate-500 py-12">
          Belum ada aktivitas yang tercatat.
        </div>
      </div>
    </div>
  );
}
