"use client";

import { useState, useEffect, useCallback } from "react";
import {
  PlusCircle,
  Calendar,
  Ticket,
  Users,
  X,
  Loader2,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface EventData {
  id: string;
  title: string;
  description: string | null;
  bannerUrl: string | null;
  subdomain: string | null;
  createdAt: string;
  ticketCount: number;
  totalSold: number;
  totalQuota: number;
  transactionCount: number;
}

export default function PanitiaEventsPage() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [error, setError] = useState("");

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/events");
      if (!res.ok) throw new Error("Gagal memuat event");
      const data = await res.json();
      setEvents(data);
    } catch {
      setError("Gagal memuat daftar event");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    try {
      setCreating(true);
      setError("");
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle.trim(),
          description: formDescription.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal membuat event");
      }

      setFormTitle("");
      setFormDescription("");
      setShowModal(false);
      await fetchEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Event Saya</h2>
          <p className="text-slate-400 text-sm mt-1">
            Kelola semua event yang Anda buat
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-xl shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98]"
        >
          <PlusCircle className="h-4 w-4" />
          Buat Event Baru
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
      {!loading && events.length === 0 && (
        <div className="p-12 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 flex items-center justify-center">
            <Sparkles className="h-10 w-10 text-indigo-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-200 mb-2">
            Belum Ada Event
          </h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
            Anda belum memiliki event apa pun. Mulai buat event pertama Anda dan
            jangkau lebih banyak peserta!
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-emerald-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="h-4 w-4" />
            Buat Event Pertama
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Event Grid */}
      {!loading && events.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event, index) => (
            <div
              key={event.id}
              className="group p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm relative overflow-hidden transition-all duration-300 hover:border-slate-700 hover:bg-slate-900/70 hover:shadow-xl hover:shadow-indigo-500/5"
            >
              {/* Decorative gradient blob */}
              <div
                className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[50px] transition-opacity duration-300 opacity-0 group-hover:opacity-100 ${
                  index % 2 === 0
                    ? "bg-indigo-500/20"
                    : "bg-emerald-500/20"
                }`}
              />

              {/* Header */}
              <div className="relative">
                <h3 className="text-lg font-semibold text-slate-100 mb-1 group-hover:text-white transition-colors line-clamp-1">
                  {event.title}
                </h3>
                {event.description && (
                  <p className="text-sm text-slate-400 line-clamp-2 mb-4">
                    {event.description}
                  </p>
                )}
                {!event.description && <div className="mb-4" />}
              </div>

              {/* Stats Row */}
              <div className="relative grid grid-cols-3 gap-3 mb-4">
                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Ticket className="h-3.5 w-3.5 text-indigo-400" />
                    <span className="text-xs text-slate-400">Tiket</span>
                  </div>
                  <p className="text-lg font-bold text-slate-100">
                    {event.ticketCount}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Users className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-xs text-slate-400">Terjual</span>
                  </div>
                  <p className="text-lg font-bold text-slate-100">
                    {event.totalSold}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Calendar className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-xs text-slate-400">Dibuat</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-100 mt-0.5">
                    {formatDate(event.createdAt)}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="relative flex items-center justify-between pt-4 border-t border-slate-800/50">
                <span className="text-xs text-slate-500">
                  {event.transactionCount} transaksi
                </span>
                <a
                  href={`/dashboard/panitia/events/${event.id}`}
                  className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                >
                  Kelola Event
                  <ArrowRight className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Event Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !creating && setShowModal(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-black/50 overflow-hidden">
            {/* Modal gradient decoration */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-emerald-500" />

            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-100">
                  Buat Event Baru
                </h3>
                <button
                  onClick={() => !creating && setShowModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Judul Event <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Contoh: Workshop React 2026"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm"
                    required
                    disabled={creating}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Deskripsi
                  </label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Jelaskan event Anda secara singkat..."
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm resize-none"
                    disabled={creating}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => !creating && setShowModal(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-sm font-medium hover:bg-slate-700 transition-colors"
                    disabled={creating}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !formTitle.trim()}
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
                        Buat Event
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
