import Link from "next/link";
import { ArrowRight, Ticket, ShieldCheck, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 overflow-hidden relative">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[150px] translate-y-1/4 pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-10 border-b border-slate-800/50 backdrop-blur-xl bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-emerald-400 font-poppins">
            CampusTicketing
          </div>
          <div className="flex gap-4">
            <Link 
              href="/login" 
              className="px-6 py-2.5 rounded-full text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300"
            >
              Masuk
            </Link>
            <Link 
              href="/register" 
              className="px-6 py-2.5 rounded-full text-sm font-medium bg-indigo-500 hover:bg-indigo-600 shadow-lg shadow-indigo-500/25 transition-all duration-300"
            >
              Daftar Sekarang
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-8">
          <Zap className="h-4 w-4" /> Platform Event Mahasiswa Terdepan
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 font-poppins leading-tight">
          Kelola Event Kampus <br className="hidden md:block" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-emerald-400 to-indigo-400">
            Lebih Profesional.
          </span>
        </h1>
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12">
          Platform enabler manajemen tiket event kampus dengan sistem QR Code, pembayaran otomatis, dan panel terdedikasi untuk Panitia & Scanner.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/register" 
            className="w-full sm:w-auto px-8 py-4 rounded-full text-base font-semibold bg-gradient-to-r from-indigo-500 to-emerald-500 hover:from-indigo-400 hover:to-emerald-400 text-white shadow-xl hover:shadow-indigo-500/25 transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            Mulai Buat Event 
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </main>

      {/* Features Preview */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: Ticket, title: "Manajemen Tiket Mudah", desc: "Buat tiket gratis atau berbayar dengan batas kuota otomatis." },
          { icon: Zap, title: "Pembayaran Otomatis", desc: "Terima pembayaran via QRIS, Virtual Account, dan E-Wallet (Tripay)." },
          { icon: ShieldCheck, title: "Sistem Scanner Aman", desc: "Aplikasi khusus scanner untuk validasi tiket QR Code super cepat." }
        ].map((feature, i) => (
          <div key={i} className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl hover:bg-slate-800/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-6">
              <feature.icon className="h-6 w-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
            <p className="text-slate-400">{feature.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
