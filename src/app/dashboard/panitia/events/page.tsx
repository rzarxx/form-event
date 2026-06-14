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
          <h2 className="text-2xl font-bold text-gray-900">Event Saya</h2>
          <p className="text-gray-500 text-sm mt-1">
            Kelola semua event yang Anda buat
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg shadow-sm transition-all"
        >
          <PlusCircle className="h-4 w-4" />
          Buat Event Baru
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
      {!loading && events.length === 0 && (
        <div className="p-12 rounded-xl bg-white ring-1 ring-gray-950/5 shadow-sm text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-indigo-50 flex items-center justify-center">
            <Sparkles className="h-10 w-10 text-indigo-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Belum Ada Event
          </h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
            Anda belum memiliki event apa pun. Mulai buat event pertama Anda dan
            jangkau lebih banyak peserta!
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg shadow-sm transition-all"
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
              className="group p-6 rounded-xl bg-white ring-1 ring-gray-950/5 shadow-sm relative overflow-hidden transition-all hover:shadow-md"
            >
              {/* Header */}
              <div className="relative">
                <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                  {event.title}
                </h3>
                {event.description && (
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                    {event.description}
                  </p>
                )}
                {!event.description && <div className="mb-4" />}
              </div>

              {/* Stats Row */}
              <div className="relative grid grid-cols-3 gap-3 mb-4">
                <div className="p-3 rounded-lg bg-gray-50 ring-1 ring-gray-950/5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Ticket className="h-3.5 w-3.5 text-indigo-600" />
                    <span className="text-xs text-gray-500">Tiket</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {event.ticketCount}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 ring-1 ring-gray-950/5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Users className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-xs text-gray-500">Terjual</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {event.totalSold}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 ring-1 ring-gray-950/5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Calendar className="h-3.5 w-3.5 text-amber-600" />
                    <span className="text-xs text-gray-500">Dibuat</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">
                    {formatDate(event.createdAt)}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="relative flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  {event.transactionCount} transaksi
                </span>
                <a
                  href={`/dashboard/panitia/events/${event.id}`}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-500 transition-colors flex items-center gap-1"
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
            className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
            onClick={() => !creating && setShowModal(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-lg rounded-xl bg-white shadow-xl overflow-hidden ring-1 ring-gray-950/5">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Buat Event Baru
                </h3>
                <button
                  onClick={() => !creating && setShowModal(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Judul Event <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Contoh: Workshop React 2026"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                    required
                    disabled={creating}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Deskripsi
                  </label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Jelaskan event Anda secara singkat..."
                    rows={4}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm resize-none"
                    disabled={creating}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => !creating && setShowModal(false)}
                    className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                    disabled={creating}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !formTitle.trim()}
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
