import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, Ticket as TicketIcon } from "lucide-react";

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: { tickets: true },
  });

  if (!event) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 pb-20">
      {/* Banner */}
      <div className="relative w-full h-64 md:h-96 bg-slate-900">
        {event.bannerUrl ? (
          <Image
            src={event.bannerUrl}
            alt={event.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-900 border-b border-slate-800">
            <Calendar className="w-16 h-16 text-slate-700" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        {/* Event Header */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-6 md:p-10 shadow-xl">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
            {event.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm md:text-base">
            {/* You can add more event details here if available in the schema */}
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              <span>See details below</span>
            </div>
          </div>
          
          <div className="mt-8 prose prose-invert max-w-none">
            <h3 className="text-xl font-semibold text-white mb-3">About the Event</h3>
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
              {event.description}
            </p>
          </div>
        </div>

        {/* Tickets Section */}
        <div className="mt-12">
          <div className="flex items-center gap-3 mb-8">
            <TicketIcon className="w-8 h-8 text-emerald-400" />
            <h2 className="text-2xl md:text-3xl font-bold text-white">Tickets</h2>
          </div>

          {event.tickets && event.tickets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {event.tickets.map((ticket) => {
                const isSoldOut = ticket.sold >= ticket.quota;
                
                return (
                  <div 
                    key={ticket.id} 
                    className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-colors duration-200"
                  >
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{ticket.name}</h3>
                      <div className="flex items-end gap-2 mb-4">
                        <span className="text-3xl font-bold text-emerald-400">
                          {Number(ticket.price) === 0 ? "FREE" : `Rp ${Number(ticket.price).toLocaleString("id-ID")}`}
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Quota</span>
                          <span className="text-slate-200">{ticket.quota} tickets</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2">
                          <div 
                            className="bg-indigo-500 h-2 rounded-full" 
                            style={{ width: `${Math.min(100, (ticket.sold / ticket.quota) * 100)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>{ticket.sold} Sold</span>
                          <span>{ticket.quota - ticket.sold} Left</span>
                        </div>
                      </div>
                    </div>

                    <Link 
                      href={`/checkout/${event.id}?ticketId=${ticket.id}`}
                      className={`block w-full py-3 px-4 text-center rounded-xl font-semibold transition-all duration-200 ${
                        isSoldOut 
                          ? "bg-slate-800 text-slate-500 cursor-not-allowed pointer-events-none"
                          : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                      }`}
                      aria-disabled={isSoldOut}
                      tabIndex={isSoldOut ? -1 : undefined}
                    >
                      {isSoldOut ? "Sold Out" : "Beli Tiket"}
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-10 text-center">
              <TicketIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-300 mb-2">No tickets available</h3>
              <p className="text-slate-500">Tickets for this event have not been released yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
