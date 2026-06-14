"use client";

import { useEffect, useState } from "react";
import { Loader2, Ticket, ExternalLink, CalendarDays, Users } from "lucide-react";

interface AdminEventData {
  id: string;
  title: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  _count: {
    tickets: number;
    transactions: number;
  };
}

export default function SuperAdminEventsPage() {
  const [events, setEvents] = useState<AdminEventData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch("/api/admin/events");
        if (res.ok) {
          const data = await res.json();
          setEvents(data);
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Kelola Semua Event</h1>
        <p className="text-slate-400">Pantau seluruh event yang dibuat oleh panitia di platform ini.</p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Nama Event</th>
                <th className="px-6 py-4">Panitia</th>
                <th className="px-6 py-4 text-center">Tiket Tersedia</th>
                <th className="px-6 py-4 text-center">Transaksi</th>
                <th className="px-6 py-4 text-center">Dibuat Pada</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <CalendarDays className="mx-auto h-8 w-8 mb-3 opacity-50" />
                    Belum ada event yang dibuat di platform ini.
                  </td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">
                      {event.title}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-indigo-400" />
                        <div>
                          <p className="text-slate-200">{event.user?.name || "Unknown"}</p>
                          <p className="text-xs text-slate-500">{event.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-300">
                        <Ticket className="w-3 h-3 mr-1" />
                        {event._count.tickets} jenis
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-emerald-400 font-semibold">{event._count.transactions}</span>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-400">
                      {new Date(event.createdAt).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a
                        href={`/e/${event.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center p-2 text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                        title="Lihat Halaman Publik"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
