"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Ticket, ShieldCheck, Zap, Users, BarChart3, QrCode, Menu, X, CheckCircle2, ChevronRight, Smartphone } from "lucide-react";

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    { icon: Ticket, title: "E-Ticket Instan", desc: "Peserta menerima tiket QR Code via WhatsApp/Email detik itu juga setelah pembayaran." },
    { icon: Zap, title: "Pembayaran Otomatis", desc: "Terima dana via QRIS & Virtual Account tanpa cek mutasi rekening secara manual." },
    { icon: Smartphone, title: "Scanner App", desc: "Cukup gunakan HP panitia untuk memindai tiket di lokasi. Anti-tiket palsu & ganda." },
    { icon: Users, title: "Kolaborasi Tim", desc: "Beri akses ke divisi lain untuk membantu scan tiket atau pantau penjualan." },
    { icon: BarChart3, title: "Analitik Real-time", desc: "Ketahui jumlah tiket terjual, pendapatan, dan total check-in secara langsung." },
    { icon: ShieldCheck, title: "Sistem Keamanan", desc: "Infrastruktur cloud yang tangguh dengan enkripsi tiket kriptografi tingkat tinggi." }
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      
      {/* Navbar */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? "bg-white/80 backdrop-blur-md border-b border-gray-200 py-3" : "bg-transparent py-5"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Ticket className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              Campus<span className="text-indigo-600">Ticketing</span>
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Fitur</Link>
            <Link href="#pricing" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Harga</Link>
            <div className="h-6 w-px bg-gray-300" />
            <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
              Masuk
            </Link>
            <Link href="/register" className="px-6 py-2.5 rounded-full text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/10 hover:shadow-gray-900/20">
              Mulai Gratis
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white/95 backdrop-blur-xl pt-24 px-6 md:hidden"
          >
            <div className="flex flex-col gap-6 items-center text-center">
              <Link href="#features" onClick={() => setMobileMenuOpen(false)} className="text-xl font-medium text-gray-700">Fitur Utama</Link>
              <Link href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-xl font-medium text-gray-700">Skema Harga</Link>
              <div className="w-full h-px bg-gray-200 my-4" />
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full py-4 text-lg font-medium text-gray-900 border border-gray-300 rounded-2xl">
                Masuk Akun
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="w-full py-4 text-lg font-bold bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-600/20">
                Buat Event Sekarang
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-52 md:pb-32 overflow-hidden bg-white">
        {/* Background Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 mb-8 backdrop-blur-sm"
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-semibold text-indigo-700">Sistem Ticketing Generasi Baru</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-8xl font-extrabold tracking-tight mb-8 leading-[1.1] text-gray-900"
          >
            Revolusi <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-emerald-500 to-indigo-600">
              Manajemen Event
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            Tinggalkan pencatatan manual. Otomatiskan penjualan tiket, verifikasi pembayaran, hingga proses check-in peserta di satu tempat.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
          >
            <Link href="/register" className="w-full sm:w-auto px-8 py-4 rounded-full text-base font-bold bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 transition-all flex items-center justify-center gap-2 group shadow-[0_10px_40px_-10px_rgba(79,70,229,0.5)]">
              Mulai Secara Gratis
              <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="#features" className="w-full sm:w-auto px-8 py-4 rounded-full text-base font-semibold bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 transition-all flex items-center justify-center shadow-sm">
              Eksplorasi Fitur
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-20 relative mx-auto max-w-5xl"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10" />
            <div className="relative rounded-2xl border border-gray-200 bg-gray-50/50 p-2 sm:p-4 backdrop-blur-sm overflow-hidden shadow-2xl shadow-indigo-900/5">
              <div className="aspect-[16/9] md:aspect-[21/9] bg-white rounded-xl border border-gray-100 flex items-center justify-center relative overflow-hidden">
                {/* Placeholder Mockup */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-emerald-50" />
                <div className="text-center z-10">
                  <BarChart3 className="w-16 h-16 text-indigo-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-semibold text-lg">Tampilan Dashboard Intuitif</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Detail */}
      <section id="features" className="py-24 sm:py-32 relative bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 text-gray-900 tracking-tight">Teknologi Skala <span className="text-indigo-600">Premium</span> <br/>Untuk Event Anda</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">Solusi *end-to-end* yang dirancang untuk memangkas kerumitan administrasi hingga 90%.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((f, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                key={i} 
                className="p-8 rounded-3xl bg-white border border-gray-200 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-100 transition-transform">
                  <f.icon className="h-7 w-7 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{f.title}</h3>
                <p className="text-gray-600 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 sm:py-32 relative overflow-hidden bg-white border-t border-gray-200">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none" />
         
         <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
            <h2 className="text-3xl sm:text-5xl font-extrabold mb-6 text-gray-900">Investasi yang <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">Masuk Akal</span></h2>
            <p className="text-lg sm:text-xl text-gray-600 mb-12">Tanpa langganan bulanan. Kami hanya membebankan biaya layanan kecil jika event Anda sukses.</p>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="p-8 sm:p-12 rounded-[2rem] bg-indigo-900 border border-indigo-800 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.05]">
                <Ticket className="w-48 h-48 rotate-12 text-white" />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-left">
                <div>
                  <p className="text-indigo-300 font-semibold mb-2 uppercase tracking-wider text-sm">Platform Fee</p>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-5xl sm:text-6xl font-extrabold text-white">Rp 2.000</span>
                    <span className="text-indigo-200 font-medium">/ tiket</span>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-indigo-100"><CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0"/> Gratis sepenuhnya untuk event gratis</li>
                    <li className="flex items-center gap-3 text-indigo-100"><CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0"/> Akses penuh ke aplikasi Scanner</li>
                    <li className="flex items-center gap-3 text-indigo-100"><CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0"/> Dukungan QRIS & Virtual Account</li>
                  </ul>
                </div>
                <div className="w-full md:w-auto">
                  <Link href="/register" className="block w-full text-center px-8 py-5 rounded-2xl font-bold bg-white text-indigo-900 hover:bg-gray-50 transition-colors shadow-lg">
                    Mulai Buat Event
                  </Link>
                  <p className="text-xs text-center text-indigo-300 mt-4">Proses pendaftaran kurang dari 1 menit.</p>
                </div>
              </div>
            </motion.div>
         </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-8 text-gray-900 tracking-tight">Siap Memajukan Event Anda?</h2>
          <Link href="/register" className="inline-flex items-center justify-center px-8 py-4 rounded-full text-lg font-bold bg-gray-900 text-white hover:bg-black hover:scale-105 transition-all gap-2 group shadow-xl shadow-gray-900/10">
            Daftar Sebagai Panitia
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Ticket className="h-6 w-6 text-indigo-600" />
            <span className="font-bold text-gray-900 tracking-tight text-lg">CampusTicketing</span>
          </div>
          <p className="text-gray-500 text-sm font-medium">&copy; 2026 CampusTicketing. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
