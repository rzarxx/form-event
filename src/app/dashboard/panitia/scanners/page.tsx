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

  // Confirm Modal State for delete
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

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

  const handleDelete = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Hapus Scanner",
      message: "Yakin ingin menghapus akun scanner ini? Mereka tidak akan bisa lagi melakukan check-in tiket.",
      onConfirm: async () => {
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
      }
    });
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
          <h2 className="text-2xl font-bold text-gray-900">Akun Scanner</h2>
          <p className="text-gray-500 text-sm mt-1">
            Kelola akun scanner untuk check-in tiket di event Anda
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg shadow-sm transition-all"
        >
          <PlusCircle className="h-4 w-4" />
          Tambah Scanner
        </button>
      </div>

      {/* Error Toast */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      )}

      {/* Empty State */}
      {!loading && scanners.length === 0 && (
        <div className="p-12 rounded-xl bg-white ring-1 ring-gray-950/5 shadow-sm text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-indigo-50 flex items-center justify-center">
            <QrCode className="h-10 w-10 text-indigo-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Belum Ada Scanner
          </h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
            Buat akun scanner agar tim Anda dapat melakukan check-in tiket di
            lokasi event menggunakan QR code.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg shadow-sm transition-all"
          >
            <PlusCircle className="h-4 w-4" />
            Buat Scanner Pertama
          </button>
        </div>
      )}

      {/* Scanners Table */}
      {!loading && scanners.length > 0 && (
        <div className="rounded-xl bg-white ring-1 ring-gray-950/5 shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 px-6 py-3.5 bg-gray-50 border-b border-gray-200">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Nama
            </span>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Email
            </span>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Dibuat
            </span>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider w-20 text-center">
              Aksi
            </span>
          </div>

          {/* Table Rows */}
          {scanners.map((scanner) => (
            <div
              key={scanner.id}
              className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 px-6 py-4 border-b border-gray-100 last:border-b-0 items-center hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <UserCheck className="h-4 w-4 text-indigo-600" />
                </div>
                <span className="text-sm font-medium text-gray-900 truncate">
                  {scanner.name}
                </span>
              </div>
              <span className="text-sm text-gray-500 truncate">
                {scanner.email}
              </span>
              <span className="text-sm text-gray-500">
                {formatDate(scanner.createdAt)}
              </span>
              <div className="w-20 flex justify-center">
                <button
                  onClick={() => handleDelete(scanner.id)}
                  disabled={deleting === scanner.id}
                  className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
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
            className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Modal */}
          <div className="relative w-full max-w-lg rounded-xl bg-white shadow-xl ring-1 ring-gray-950/5 overflow-hidden">
            <div className="p-6">
              {/* Show credentials after successful creation */}
              {createdCredentials ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Scanner Berhasil Dibuat!
                    </h3>
                    <button
                      onClick={closeModal}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 mb-4">
                    <div className="flex items-start gap-2">
                      <ShieldAlert className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-emerald-800">
                        Simpan kredensial ini dan bagikan kepada tim scanner
                        Anda. Password tidak bisa dilihat lagi setelah modal ini
                        ditutup.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
                      <div>
                        <span className="text-xs text-gray-500 block">
                          Nama
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {createdCredentials.name}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          copyToClipboard(createdCredentials.name, "name")
                        }
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
                      >
                        {copiedField === "name" ? (
                          <Check className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
                      <div>
                        <span className="text-xs text-gray-500 block">
                          Email
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {createdCredentials.email}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          copyToClipboard(createdCredentials.email, "email")
                        }
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
                      >
                        {copiedField === "email" ? (
                          <Check className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
                      <div>
                        <span className="text-xs text-gray-500 block">
                          Password
                        </span>
                        <span className="text-sm font-mono font-medium text-gray-900">
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
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
                      >
                        {copiedField === "password" ? (
                          <Check className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={closeModal}
                    className="w-full mt-6 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium shadow-sm transition-all"
                  >
                    Selesai
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Tambah Scanner
                    </h3>
                    <button
                      onClick={closeModal}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Nama <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="Nama petugas scanner"
                        className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                        required
                        disabled={creating}
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        placeholder="scanner@email.com"
                        className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                        required
                        disabled={creating}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formPassword}
                        onChange={(e) => setFormPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                        required
                        minLength={6}
                        disabled={creating}
                      />
                      <p className="text-xs text-gray-500 mt-1.5">
                        Password ditampilkan agar Anda dapat membagikannya ke
                        petugas scanner.
                      </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 mt-6 pt-4">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
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
                        className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium shadow-sm transition-all flex items-center justify-center gap-2"
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

      {/* Confirm Delete Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl ring-1 ring-gray-950/5">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{confirmModal.title}</h3>
            <p className="text-sm text-gray-500 mb-6">{confirmModal.message}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal({ ...confirmModal, isOpen: false });
                }}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-500 transition-colors shadow-sm"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
