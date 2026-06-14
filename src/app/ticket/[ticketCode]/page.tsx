import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import { QrCode, Calendar, MapPin, User, Ticket as TicketIcon } from "lucide-react";

export default async function TicketPage({ params }: { params: Promise<{ ticketCode: string }> }) {
  const { ticketCode } = await params;
  const transaction = await prisma.transaction.findFirst({
    where: { ticketCode },
    include: {
      event: true,
      ticket: true,
    },
  });

  if (!transaction) {
    notFound();
  }

  const { event, ticket } = transaction;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">Your E-Ticket</h1>
          <p className="text-slate-400 text-sm mt-1">Please show this ticket at the entrance</p>
        </div>

        {/* Boarding Pass Container */}
        <div className="relative bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
          
          {/* Top Section - Event Info */}
          <div className="p-6 md:p-8 bg-slate-800/30">
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-1">
                <div className="inline-flex items-center rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-400 border border-indigo-500/20 mb-2">
                  {transaction.paymentStatus === "PAID" ? "CONFIRMED" : transaction.paymentStatus}
                </div>
                <h2 className="text-xl font-bold text-white leading-tight">{event.title}</h2>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Attendee</p>
                  <p className="text-sm font-semibold text-slate-200">{transaction.buyerName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
                  <TicketIcon className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Ticket Type</p>
                  <p className="text-sm font-semibold text-slate-200">{ticket.name}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dashed Separator */}
          <div className="relative h-8 flex items-center bg-slate-900">
            <div className="absolute left-0 w-4 h-8 bg-slate-950 rounded-r-full border-r border-y border-slate-800 -ml-[1px]"></div>
            <div className="w-full border-t-2 border-dashed border-slate-700/50 mx-4"></div>
            <div className="absolute right-0 w-4 h-8 bg-slate-950 rounded-l-full border-l border-y border-slate-800 -mr-[1px]"></div>
          </div>

          {/* Bottom Section - QR Code */}
          <div className="p-6 md:p-8 flex flex-col items-center justify-center bg-slate-900">
            <div className="bg-white p-4 rounded-2xl shadow-inner mb-4">
              <QrCode className="w-48 h-48 text-slate-900" strokeWidth={1} />
            </div>
            
            <div className="text-center space-y-1">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Ticket Code</p>
              <p className="text-lg font-mono font-bold text-slate-200 tracking-wider">
                {transaction.ticketCode}
              </p>
            </div>

            <div className="mt-6 text-center">
              <p className="text-[10px] text-slate-600 font-mono">
                SIG: {transaction.qrSignature || "PENDING"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-slate-500">
          <p>Powered by CampusTicketing</p>
        </div>
      </div>
    </div>
  );
}
