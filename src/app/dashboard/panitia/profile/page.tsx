"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { User, CreditCard, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"info" | "plan">("info");
  const [phone, setPhone] = useState<string>("Memuat...");
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      fetch('/api/profile')
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setPhone(data.user.phone || "Belum diatur");
          }
        })
        .catch(() => setPhone("Gagal memuat"));
    }
  }, [session]);

  const handleUpgrade = async () => {
    try {
      setIsUpgrading(true);
      const res = await fetch('/api/profile/upgrade', {
        method: 'POST',
      });
      const data = await res.json();
      
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert(data.error || "Gagal membuat transaksi upgrade.");
        setIsUpgrading(false);
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan sistem.");
      setIsUpgrading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingPassword(true);
    try {
      const res = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Sandi berhasil diubah');
        setOldPassword("");
        setNewPassword("");
      } else {
        alert(data.error || 'Gagal mengubah sandi');
      }
    } catch (err) {
      alert('Terjadi kesalahan sistem');
    }
    setIsChangingPassword(false);
  };

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const userPlan = session.user.plan || "FREE";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Profil & Billing</h1>
        <p className="text-gray-500 mt-1">Kelola informasi akun dan paket langganan Anda.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("info")}
            className={`flex-1 py-4 px-6 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === "info"
                ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <User className="w-4 h-4" />
            Info Akun
          </button>
          <button
            onClick={() => setActiveTab("plan")}
            className={`flex-1 py-4 px-6 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === "plan"
                ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Level Akun
          </button>
        </div>

        <div className="p-6 md:p-8">
          {activeTab === "info" && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Pribadi</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-100 pb-4">
                    <span className="text-sm font-medium text-gray-500">Nama Lengkap</span>
                    <span className="text-sm text-gray-900 md:col-span-2 font-medium">
                      {session.user.name || "-"}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-100 pb-4">
                    <span className="text-sm font-medium text-gray-500">Alamat Email</span>
                    <span className="text-sm text-gray-900 md:col-span-2 font-medium">
                      {session.user.email || "-"}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-100 pb-4">
                    <span className="text-sm font-medium text-gray-500">Nomor Telepon</span>
                    <span className="text-sm text-gray-900 md:col-span-2 font-medium">
                      {phone}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <span className="text-sm font-medium text-gray-500">Peran</span>
                    <span className="text-sm text-gray-900 md:col-span-2 font-medium inline-flex">
                      <span className="bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                        {session.user.role}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-gray-200 mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ubah Sandi</h3>
                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sandi Saat Ini</label>
                    <input 
                      type="password" 
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sandi Baru</label>
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-900"
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={isChangingPassword}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-all shadow-sm disabled:opacity-70 flex items-center gap-2"
                  >
                    {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Simpan Sandi Baru
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === "plan" && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Paket Langganan Saat Ini</h3>
                <p className="text-sm text-gray-500 mb-6">Tingkatkan paket Anda untuk mendapatkan akses ke fitur premium.</p>
                
                <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-xl border border-gray-200">
                  <div className={`p-4 rounded-full ${userPlan === 'PRO' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-600'}`}>
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 font-medium">Status Akun</div>
                    <div className="text-2xl font-bold text-gray-900 tracking-tight">
                      Paket {userPlan}
                    </div>
                  </div>
                </div>
              </div>

              {userPlan === "FREE" && (
                <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-100 p-6 md:p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-500 opacity-10 rounded-full blur-2xl"></div>
                  
                  <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                    <div className="space-y-2">
                      <h4 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        Upgrade ke Pro
                        <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full font-bold">POPULER</span>
                      </h4>
                      <ul className="text-sm text-gray-600 space-y-1.5">
                        <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Bebas biaya layanan platform</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Buat event tanpa batas</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Formulir kustom untuk peserta</li>
                      </ul>
                    </div>
                    
                    <button
                      onClick={handleUpgrade}
                      disabled={isUpgrading}
                      className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-xl transition-all shadow-sm shadow-indigo-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isUpgrading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Memproses...
                        </>
                      ) : (
                        <>
                          Upgrade Sekarang
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
              
              {userPlan === "PRO" && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-emerald-800">
                  <h4 className="font-semibold flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Anda adalah pengguna Pro
                  </h4>
                  <p className="text-sm text-emerald-700">
                    Nikmati semua fitur premium tanpa batas. Terima kasih telah menggunakan CampusTicketing.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
