import { auth } from "@/auth";
import { PlusCircle } from "lucide-react";

export default async function PanitiaDashboard() {
  const session = await auth();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Halo, {session?.user?.name}!</h2>
          <p className="text-slate-400 text-sm">Pantau dan kelola seluruh event Anda di sini.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg shadow-lg shadow-indigo-500/25 transition-all">
          <PlusCircle className="h-4 w-4" /> Buat Event Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-emerald-500/10 border border-indigo-500/20 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-[40px]" />
          <h3 className="text-indigo-400 text-sm font-semibold mb-2">Tiket Terjual</h3>
          <p className="text-4xl font-bold text-white">0</p>
        </div>
        
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm relative overflow-hidden">
          <h3 className="text-slate-400 text-sm font-semibold mb-2">Total Pendapatan</h3>
          <p className="text-4xl font-bold text-white">Rp 0</p>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
        <h3 className="text-lg font-semibold mb-4">Daftar Event</h3>
        <div className="text-center text-slate-500 py-12">
          Anda belum memiliki event apa pun. Mulai buat event pertama Anda!
        </div>
      </div>
    </div>
  );
}
