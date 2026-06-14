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
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Kelola Semua Event</h1>
        <p className="text-gray-500">Pantau seluruh event yang dibuat oleh panitia di platform ini.</p>
      </div>

      <div className="rounded-xl bg-white ring-1 ring-gray-950/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Nama Event</th>
                <th className="px-6 py-4">Panitia</th>
                <th className="px-6 py-4 text-center">Tiket Tersedia</th>
                <th className="px-6 py-4 text-center">Transaksi</th>
                <th className="px-6 py-4 text-center">Dibuat Pada</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <CalendarDays className="mx-auto h-8 w-8 mb-3 opacity-50" />
                    Belum ada event yang dibuat di platform ini.
                  </td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr key={event.id} className="bg-white hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {event.title}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-indigo-500" />
                        <div>
                          <p className="text-gray-900">{event.user?.name || "Unknown"}</p>
                          <p className="text-xs text-gray-500">{event.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                        <Ticket className="w-3 h-3 mr-1" />
                        {event._count.tickets} jenis
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-emerald-600 font-semibold">{event._count.transactions}</span>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-500">
                      {new Date(event.createdAt).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a
                        href={`/e/${event.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
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
