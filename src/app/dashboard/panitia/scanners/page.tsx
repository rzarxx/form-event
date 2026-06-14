"use client";

import { useState, useEffect, useCallback } from "react";
import {
  PlusCircle,
  Trash2,
  X,
  Loader2,
  UserCheck,
  Copy,
  Check,
  ShieldAlert,
  QrCode,
} from "lucide-react";

interface ScannerData {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export default function PantitiScannersPage() {
  const [scanners, setScanners] = useState<ScannerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [error, setError] = useState("");
  const [createdCredentials, setCreatedCredentials] = useState<{
    name: string;
    email: string;
    password: string;
  } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const fetchScanners = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/scanners");
      if (!res.ok) throw new Error("Gagal memuat data scanner");
      const data = await res.json();
      setScanners(data);
    } catch {
      setError("Gagal memuat daftar scanner");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScanners();
  }, [fetchScanners]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !formPassword) return;

    try {
      setCreating(true);
      setError("");
      const res = await fetch("/api/scanners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          email: formEmail.trim().toLowerCase(),
          password: formPassword,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal membuat akun scanner");
      }

      // Show credentials
      setCreatedCredentials({
        name: formName.trim(),
        email: formEmail.trim().toLowerCase(),
        password: formPassword,
      });

      setFormName("");
      setFormEmail("");
      setFormPassword("");
      await fetchScanners();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus akun scanner ini?")) return;

    try {
      setDeleting(id);
      const res = await fetch(`/api/scanners/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menghapus scanner");
      }
      await fetchScanners();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setDeleting(null);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // Fallback silent fail
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const closeModal = () => {
    if (creating) return;
    setShowModal(false);
    setCreatedCredentials(null);
    setFormName("");
    setFormEmail("");
    setFormPassword("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Akun Scanner</h2>
          <p className="text-slate-400 text-sm mt-1">
            Kelola akun scanner untuk check-in tiket di event Anda
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-xl shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98]"
        >
          <PlusCircle className="h-4 w-4" />
          Tambah Scanner
        </button>
      </div>

      {/* Error Toast */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
        </div>
      )}

      {/* Empty State */}
      {!loading && scanners.length === 0 && (
        <div className="p-12 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 flex items-center justify-center">
            <QrCode className="h-10 w-10 text-indigo-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-200 mb-2">
            Belum Ada Scanner
          </h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
            Buat akun scanner agar tim Anda dapat melakukan check-in tiket di
            lokasi event menggunakan QR code.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-emerald-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="h-4 w-4" />
            Buat Scanner Pertama
          </button>
        </div>
      )}

      {/* Scanners Table */}
      {!loading && scanners.length > 0 && (
        <div className="rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 px-6 py-3.5 bg-slate-800/30 border-b border-slate-800/50">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Nama
            </span>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Email
            </span>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Dibuat
            </span>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider w-20 text-center">
              Aksi
            </span>
          </div>

          {/* Table Rows */}
          {scanners.map((scanner) => (
            <div
              key={scanner.id}
              className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 px-6 py-4 border-b border-slate-800/30 last:border-b-0 items-center hover:bg-slate-800/20 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-indigo-500/20 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <UserCheck className="h-4 w-4 text-emerald-400" />
                </div>
                <span className="text-sm font-medium text-slate-200 truncate">
                  {scanner.name}
                </span>
              </div>
              <span className="text-sm text-slate-400 truncate">
                {scanner.email}
              </span>
              <span className="text-sm text-slate-500">
                {formatDate(scanner.createdAt)}
              </span>
              <div className="w-20 flex justify-center">
                <button
                  onClick={() => handleDelete(scanner.id)}
                  disabled={deleting === scanner.id}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                  title="Hapus scanner"
                >
                  {deleting === scanner.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Credentials Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Modal */}
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-black/50 overflow-hidden">
            {/* Gradient top bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-emerald-500" />

            <div className="p-6">
              {/* Show credentials after successful creation */}
              {createdCredentials ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-slate-100">
                      Scanner Berhasil Dibuat!
                    </h3>
                    <button
                      onClick={closeModal}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-4">
                    <div className="flex items-start gap-2">
                      <ShieldAlert className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-emerald-300">
                        Simpan kredensial ini dan bagikan kepada tim scanner
                        Anda. Password tidak bisa dilihat lagi setelah modal ini
                        ditutup.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                      <div>
                        <span className="text-xs text-slate-400 block">
                          Nama
                        </span>
                        <span className="text-sm font-medium text-slate-200">
                          {createdCredentials.name}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          copyToClipboard(createdCredentials.name, "name")
                        }
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"
                      >
                        {copiedField === "name" ? (
                          <Check className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                      <div>
                        <span className="text-xs text-slate-400 block">
                          Email
                        </span>
                        <span className="text-sm font-medium text-slate-200">
                          {createdCredentials.email}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          copyToClipboard(createdCredentials.email, "email")
                        }
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"
                      >
                        {copiedField === "email" ? (
                          <Check className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                      <div>
                        <span className="text-xs text-slate-400 block">
                          Password
                        </span>
                        <span className="text-sm font-mono font-medium text-slate-200">
                          {createdCredentials.password}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            createdCredentials.password,
                            "password"
                          )
                        }
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"
                      >
                        {copiedField === "password" ? (
                          <Check className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={closeModal}
                    className="w-full mt-6 px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium shadow-lg shadow-indigo-500/25 transition-all"
                  >
                    Selesai
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-slate-100">
                      Tambah Scanner
                    </h3>
                    <button
                      onClick={closeModal}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">
                        Nama <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="Nama petugas scanner"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm"
                        required
                        disabled={creating}
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">
                        Email <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        placeholder="scanner@email.com"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm"
                        required
                        disabled={creating}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">
                        Password <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formPassword}
                        onChange={(e) => setFormPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm"
                        required
                        minLength={6}
                        disabled={creating}
                      />
                      <p className="text-xs text-slate-500 mt-1.5">
                        Password ditampilkan agar Anda dapat membagikannya ke
                        petugas scanner.
                      </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-sm font-medium hover:bg-slate-700 transition-colors"
                        disabled={creating}
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={
                          creating ||
                          !formName.trim() ||
                          !formEmail.trim() ||
                          formPassword.length < 6
                        }
                        className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
                      >
                        {creating ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Membuat...
                          </>
                        ) : (
                          <>
                            <PlusCircle className="h-4 w-4" />
                            Buat Akun
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
