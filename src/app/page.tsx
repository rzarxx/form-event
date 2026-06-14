import Link from "next/link";
import { ArrowRight, Ticket, ShieldCheck, Zap, Users, BarChart3, QrCode } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500/30">
      {/* Navbar */}
      <nav className="fixed w-full z-50 border-b border-slate-800/50 backdrop-blur-xl bg-slate-950/80 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center">
              <Ticket className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              CampusTicketing
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Masuk
            </Link>
            <Link href="/register" className="px-5 py-2.5 rounded-full text-sm font-medium bg-white text-slate-950 hover:bg-slate-200 transition-all shadow-lg shadow-white/10">
              Mulai Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
            Platform Manajemen Event <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-emerald-400 to-indigo-400">
              Khusus Kampus & Organisasi
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Tinggalkan cara lama mengelola event. Kami menyediakan sistem tiket digital, pembayaran otomatis (QRIS), dan aplikasi scanner khusus panitia dalam satu platform terpadu.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="w-full sm:w-auto px-8 py-4 rounded-full text-base font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 group">
              Buat Event Pertama Anda
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="#features" className="w-full sm:w-auto px-8 py-4 rounded-full text-base font-medium bg-slate-800 hover:bg-slate-700 text-white transition-all flex items-center justify-center">
              Pelajari Cara Kerjanya
            </Link>
          </div>
        </div>
      </section>

      {/* Features Detail */}
      <section id="features" className="py-24 bg-slate-900/50 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Fitur Lengkap Untuk Panitia</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Kami merancang sistem ini untuk mempermudah tugas divisi acara, humas, hingga keamanan.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Ticket, title: "Sistem E-Ticket Otomatis", desc: "Setiap peserta mendapatkan e-ticket ber-QR Code via WhatsApp/Email langsung setelah membayar." },
              { icon: Zap, title: "Pembayaran Instan", desc: "Terima pembayaran via QRIS, Virtual Account, GoPay, OVO tanpa harus mengecek mutasi rekening manual." },
              { icon: QrCode, title: "Aplikasi Scanner Khusus", desc: "Panitia di lapangan cukup memindai tiket dengan HP. Mencegah tiket palsu atau penggunaan ganda." },
              { icon: Users, title: "Kelola Tim Panitia", desc: "Tambahkan anggota panitia lain dan beri mereka akses khusus sebagai Scanner atau Admin Event." },
              { icon: BarChart3, title: "Laporan Real-time", desc: "Pantau jumlah tiket terjual, pendapatan, dan peserta yang sudah check-in secara langsung (real-time)." },
              { icon: ShieldCheck, title: "Keamanan Tingkat Tinggi", desc: "QR Code dilengkapi dengan Signature kriptografi anti-palsu yang di-generate khusus per peserta." }
            ].map((f, i) => (
              <div key={i} className="p-8 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-6">
                  <f.icon className="h-6 w-6 text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-100">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing / Biaya Layanan */}
      <section className="py-24 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />
         
         <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Tanpa Biaya Langganan Bulanan</h2>
            <p className="text-xl text-slate-400 mb-10">Anda hanya dikenakan biaya layanan administrasi per tiket terjual. Cocok untuk semua skala event kampus Anda.</p>
            
            <div className="p-8 rounded-3xl bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-emerald-500/5" />
              <div className="relative z-10">
                <div className="text-5xl font-extrabold text-white mb-2">Rp 2.000 <span className="text-lg font-medium text-slate-400">/ tiket berbayar</span></div>
                <p className="text-slate-300 mb-8 mt-4">Gratis 100% untuk event atau pendaftaran tidak berbayar (Free Event).</p>
                
                <Link href="/register" className="block w-full py-4 rounded-xl font-bold bg-white text-slate-900 hover:bg-slate-200 transition-colors">
                  Mulai Gunakan Sekarang
                </Link>
              </div>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-500 border-t border-slate-800/50 text-sm">
        <p>&copy; 2026 CampusTicketing by RezzDev. All rights reserved.</p>
      </footer>
    </div>
  );
}
