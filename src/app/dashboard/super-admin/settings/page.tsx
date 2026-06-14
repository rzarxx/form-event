"use client";

import { useEffect, useState, useCallback } from "react";
import { Settings, Save, Loader2, CheckCircle2, AlertCircle, CreditCard, LayoutTemplate } from "lucide-react";

interface SystemSettings {
  id: string;
  platformFee: number | string;
  freeQuotaLimit: number;
  freeMaxEvents: number;
  freeMaxTicketsPerEvent: number;
  freeCustomFormEnabled: boolean;
  proPlanPrice: number | string;
  updatedAt: string;
}

type Toast = {
  type: "success" | "error";
  message: string;
} | null;

export default function SystemSettingsPage() {
  const [activeTab, setActiveTab] = useState<"plan" | "payment">("plan");
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

  const [platformFee, setPlatformFee] = useState("");
  const [freeQuotaLimit, setFreeQuotaLimit] = useState("");
  const [freeMaxEvents, setFreeMaxEvents] = useState("");
  const [freeMaxTicketsPerEvent, setFreeMaxTicketsPerEvent] = useState("");
  const [freeCustomFormEnabled, setFreeCustomFormEnabled] = useState(false);
  const [proPlanPrice, setProPlanPrice] = useState("");

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/settings");
      if (!res.ok) throw new Error("Failed to fetch settings");
      const data = await res.json();
      setSettings(data);
      setPlatformFee(String(data.platformFee || 0));
      setFreeQuotaLimit(String(data.freeQuotaLimit || 150));
      setFreeMaxEvents(String(data.freeMaxEvents ?? 1));
      setFreeMaxTicketsPerEvent(String(data.freeMaxTicketsPerEvent ?? 3));
      setFreeCustomFormEnabled(Boolean(data.freeCustomFormEnabled));
      setProPlanPrice(String(data.proPlanPrice || 99000));
    } catch (err) {
      console.error("Error fetching settings:", err);
      showToast("error", "Gagal memuat pengaturan sistem");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platformFee: Number(platformFee),
          freeQuotaLimit: Number(freeQuotaLimit),
          freeMaxEvents: Number(freeMaxEvents),
          freeMaxTicketsPerEvent: Number(freeMaxTicketsPerEvent),
          freeCustomFormEnabled: freeCustomFormEnabled,
          proPlanPrice: Number(proPlanPrice)
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast("error", data.error || "Gagal menyimpan pengaturan");
        return;
      }

      setSettings(data);
      showToast("success", "Pengaturan berhasil disimpan");
    } catch {
      showToast("error", "Terjadi kesalahan saat menyimpan");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-6 w-6 text-indigo-600 animate-spin" />
        <span className="ml-3 text-gray-500 text-sm">
          Memuat pengaturan...
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-xl transition-all animate-in slide-in-from-right bg-white ${
            toast.type === "success"
              ? "border-emerald-200 text-emerald-600"
              : "border-red-200 text-red-600"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
          )}
          <span className="text-sm font-medium text-gray-900">{toast.message}</span>
        </div>
      )}

      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100">
          <Settings className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Pengaturan Sistem
          </h1>
          <p className="text-sm text-gray-500">
            Konfigurasi platform CampusTicketing
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("plan")}
            className={`flex-1 py-4 px-6 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === "plan"
                ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <LayoutTemplate className="w-4 h-4" />
            Paket & Kuota
          </button>
          <button
            onClick={() => setActiveTab("payment")}
            className={`flex-1 py-4 px-6 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === "payment"
                ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Pembayaran
          </button>
        </div>

        {activeTab === "plan" && (
          <div>
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-900">
                Fitur Plan (Akun Gratis & PRO)
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Atur harga langganan PRO dan batasan untuk akun gratis.
              </p>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                  Harga Langganan PRO (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={proPlanPrice}
                  onChange={(e) => setProPlanPrice(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all shadow-sm"
                  placeholder="99000"
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  Harga yang harus dibayar panitia untuk upgrade ke paket PRO.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                  Batas Kuota Event Gratis
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={freeQuotaLimit}
                  onChange={(e) => setFreeQuotaLimit(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all shadow-sm"
                  placeholder="150"
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  Jumlah maksimum peserta untuk event dengan tiket gratis (tanpa kode referral).
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Batasan Akun Gratis</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Maksimal Event Aktif</label>
                    <input
                      type="number"
                      value={freeMaxEvents}
                      onChange={(e) => setFreeMaxEvents(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Maksimal Tipe Tiket</label>
                    <input
                      type="number"
                      value={freeMaxTicketsPerEvent}
                      onChange={(e) => setFreeMaxTicketsPerEvent(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-4">
                  <input
                    type="checkbox"
                    id="freeCustomFormEnabled"
                    checked={freeCustomFormEnabled}
                    onChange={(e) => setFreeCustomFormEnabled(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600"
                  />
                  <label htmlFor="freeCustomFormEnabled" className="text-sm font-medium text-gray-900">
                    Izinkan Form Pendaftaran Kustom untuk Akun Gratis
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "payment" && (
          <div>
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-900">
                Pengaturan Pembayaran
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Atur konfigurasi biaya platform dan integrasi payment gateway.
              </p>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                  Platform Fee (Convenience Fee)
                </label>
                <div className="relative max-w-sm">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
                    Rp
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={platformFee}
                    onChange={(e) => setPlatformFee(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all shadow-sm"
                    placeholder="0"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1.5">
                  Biaya tambahan yang dikenakan per transaksi tiket berbayar (dibebankan ke pembeli).
                </p>
              </div>

              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <h4 className="text-sm font-semibold text-amber-800 mb-1">Konfigurasi Tripay</h4>
                <p className="text-xs text-amber-700">
                  Untuk alasan keamanan standar industri PCI-DSS, `API Key`, `Private Key`, dan `Merchant Code` Tripay harus dikonfigurasi melalui file <b>.env</b> di dalam server Anda. Sistem tidak mengeksposnya ke halaman dashboard ini untuk mencegah pencurian kredensial.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="p-6 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <p className="text-xs text-gray-500">
            {settings?.updatedAt && (
              <>
                Terakhir diperbarui:{" "}
                {new Date(settings.updatedAt).toLocaleString("id-ID", {
                  day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
                })}
              </>
            )}
          </p>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-sm disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
}
