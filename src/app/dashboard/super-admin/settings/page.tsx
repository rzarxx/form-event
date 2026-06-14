"use client";

import { useEffect, useState, useCallback } from "react";
import { Settings, Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface SystemSettings {
  id: string;
  platformFee: number | string;
  freeQuotaLimit: number;
  updatedAt: string;
}

type Toast = {
  type: "success" | "error";
  message: string;
} | null;

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

  const [platformFee, setPlatformFee] = useState("");
  const [freeQuotaLimit, setFreeQuotaLimit] = useState("");
  const [freeMaxEvents, setFreeMaxEvents] = useState("");
  const [freeMaxTicketsPerEvent, setFreeMaxTicketsPerEvent] = useState("");
  const [freeCustomFormEnabled, setFreeCustomFormEnabled] = useState(false);

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
          freeCustomFormEnabled: freeCustomFormEnabled
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
    <div className="max-w-2xl space-y-6">
      {/* Toast Notification */}
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

      {/* Header */}
      <div className="flex items-center gap-3">
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

      {/* Settings Card */}
      <div className="rounded-xl bg-white ring-1 ring-gray-950/5 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">
            Biaya & Kuota
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Atur biaya platform dan batas kuota event gratis
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Platform Fee */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
              Platform Fee (Convenience Fee)
            </label>
            <div className="relative">
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
              Biaya tambahan yang dikenakan per transaksi tiket berbayar
            </p>
          </div>

          {/* Free Quota Limit */}
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
              Jumlah maksimum peserta untuk event dengan tiket gratis (tanpa kode
              referral)
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">
            Pembatasan Akun Gratis (Panitia)
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Fitur yang dibatasi untuk pengguna yang belum memiliki kode referral Mitra.
          </p>
        </div>

        <div className="p-6 space-y-6 pt-0">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
              Batas Maksimal Event Aktif
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={freeMaxEvents}
              onChange={(e) => setFreeMaxEvents(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all shadow-sm"
              placeholder="1"
            />
            <p className="text-xs text-gray-500 mt-1.5">
              Batas event yang bisa dibuat oleh satu akun gratis.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
              Batas Tipe Tiket per Event
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={freeMaxTicketsPerEvent}
              onChange={(e) => setFreeMaxTicketsPerEvent(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all shadow-sm"
              placeholder="3"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="freeCustomFormEnabled"
              checked={freeCustomFormEnabled}
              onChange={(e) => setFreeCustomFormEnabled(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
            />
            <label htmlFor="freeCustomFormEnabled" className="text-sm font-medium text-gray-900">
              Izinkan Form Pendaftaran Kustom
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            {settings?.updatedAt && (
              <>
                Terakhir diperbarui:{" "}
                {new Date(settings.updatedAt).toLocaleString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </>
            )}
          </p>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-sm disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Simpan Perubahan
          </button>
        </div>
      </div>

      {/* Info Card */}
      <div className="rounded-xl bg-white ring-1 ring-gray-950/5 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">
          💡 Informasi
        </h3>
        <ul className="space-y-1.5 text-xs text-gray-600">
          <li>
            • <strong className="text-gray-900">Platform Fee</strong> akan
            ditambahkan ke harga tiket berbayar saat checkout.
          </li>
          <li>
            • <strong className="text-gray-900">Batas Kuota Gratis</strong>{" "}
            membatasi jumlah peserta yang dapat mendaftar ke event gratis. Panitia
            yang menggunakan kode referral mendapat kuota tak terbatas.
          </li>
        </ul>
      </div>
    </div>
  );
}
