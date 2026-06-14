import { auth } from "@/auth";
import { ScanLine } from "lucide-react";

export default async function ScannerDashboard() {
  const session = await auth();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <div className="w-24 h-24 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20">
        <ScanLine className="h-10 w-10 text-indigo-400 animate-pulse" />
      </div>
      <h2 className="text-2xl font-bold text-slate-100 mb-2">Scanner Mode Aktif</h2>
      <p className="text-slate-400 max-w-md mb-8">
        Halo {session?.user?.name}, Anda masuk sebagai Scanner. Arahkan kamera ke QR Code peserta untuk melakukan Check-In instan.
      </p>
      
      <button className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-emerald-500 hover:from-indigo-600 hover:to-emerald-600 text-white font-bold rounded-xl shadow-xl shadow-indigo-500/25 transition-all flex items-center gap-3">
        <ScanLine className="h-6 w-6" />
        Mulai Scan Tiket
      </button>
    </div>
  );
}
