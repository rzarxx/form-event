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
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      {/* Banner */}
      <div className="relative w-full h-64 md:h-96 bg-gray-200">
        {event.bannerUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={event.bannerUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 border-b border-gray-300">
            <Calendar className="w-16 h-16 text-gray-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-gray-50/40 to-transparent"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        {/* Event Header */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-10 shadow-sm">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">
            {event.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm md:text-base">
            {/* You can add more event details here if available in the schema */}
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              <span>See details below</span>
            </div>
          </div>
          
          <div className="mt-8 prose max-w-none">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">About the Event</h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
              {event.description}
            </p>
          </div>
        </div>

        {/* Tickets Section */}
        <div className="mt-12">
          <div className="flex items-center gap-3 mb-8">
            <TicketIcon className="w-8 h-8 text-emerald-400" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Tickets</h2>
          </div>

          {event.tickets && event.tickets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {event.tickets.map((ticket) => {
                const isSoldOut = ticket.sold >= ticket.quota;
                const percentageSold = ticket.quota > 0 ? (ticket.sold / ticket.quota) * 100 : 0;
                
                let quotaLabel = "Tiket Tersedia";
                let quotaColor = "text-emerald-700 bg-emerald-50 border-emerald-200";

                if (isSoldOut) {
                  quotaLabel = "Habis Terjual";
                  quotaColor = "text-gray-600 bg-gray-100 border-gray-200";
                } else if (percentageSold >= 80) {
                  quotaLabel = "Hampir Habis!";
                  quotaColor = "text-red-700 bg-red-50 border-red-200";
                } else if (percentageSold >= 50) {
                  quotaLabel = "Penjualan Cepat";
                  quotaColor = "text-amber-700 bg-amber-50 border-amber-200";
                }
                
                return (
                  <div 
                    key={ticket.id} 
                    className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col justify-between hover:border-gray-300 shadow-sm transition-colors duration-200"
                  >
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{ticket.name}</h3>
                      <div className="flex items-end gap-2 mb-4">
                        <span className="text-3xl font-bold text-emerald-600">
                          {Number(ticket.price) === 0 ? "FREE" : `Rp ${Number(ticket.price).toLocaleString("id-ID")}`}
                        </span>
                      </div>
                      
                      <div className="space-y-3 mb-6">
                        <div className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${quotaColor}`}>
                          {quotaLabel}
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full ${isSoldOut ? 'bg-gray-300' : percentageSold >= 80 ? 'bg-red-500' : percentageSold >= 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                            style={{ width: `${Math.min(100, percentageSold)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <Link 
                      href={`/checkout/${event.id}?ticketId=${ticket.id}`}
                      className={`block w-full py-3 px-4 text-center rounded-xl font-semibold transition-all duration-200 ${
                        isSoldOut 
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none"
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
            <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center shadow-sm">
              <TicketIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets available</h3>
              <p className="text-gray-500">Tickets for this event have not been released yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
