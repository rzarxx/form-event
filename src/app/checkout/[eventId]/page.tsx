"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Loader2, Calendar, Ticket as TicketIcon, CheckCircle2, AlertCircle } from "lucide-react";

type FormSchemaField = {
  name: string;
  label: string;
  type: string;
};

type Event = {
  id: string;
  title: string;
  bannerUrl: string | null;
  formSchema: FormSchemaField[] | null;
  tickets: Ticket[];
};

type Ticket = {
  id: string;
  name: string;
  price: number;
};

type PaymentChannel = {
  code: string;
  name: string;
  group: string;
  icon_url: string;
  fee_flat: number;
  fee_percent: number;
};

export default function CheckoutPage({ params }: { params: Promise<{ eventId: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ticketId = searchParams.get("ticketId");
  const unwrappedParams = use(params);
  const { eventId } = unwrappedParams;

  const [event, setEvent] = useState<Event | null>(null);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [channels, setChannels] = useState<PaymentChannel[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [method, setMethod] = useState("");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const platformFee = 2000;

  useEffect(() => {
    async function loadData() {
      try {
        if (!ticketId) {
          setError("No ticket selected");
          setLoading(false);
          return;
        }

        // Fetch Event
        const eventRes = await fetch(`/api/public/events/${eventId}`);
        if (!eventRes.ok) throw new Error("Failed to load event");
        const eventData = await eventRes.json();
        setEvent(eventData);

        const foundTicket = eventData.tickets?.find((t: Ticket) => t.id === ticketId);
        if (!foundTicket) throw new Error("Ticket not found");
        setTicket(foundTicket);

        // Fetch Channels
        const channelsRes = await fetch("/api/tripay/channels");
        if (channelsRes.ok) {
          const channelsData = await channelsRes.json();
          if (channelsData.success && channelsData.data) {
            setChannels(channelsData.data);
          }
        }
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [eventId, ticketId]);

  const handleDynamicChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!method) {
      setError("Please select a payment method.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          ticketId,
          buyerName: name,
          buyerEmail: email,
          buyerPhone: phone,
          method,
          formData,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Checkout failed");
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  const ticketPrice = ticket?.price || 0;
  // Calculate total fee based on selected method, wait no, instruction says:
  // "Sidebar/Summary: Show Ticket Price + Platform Fee (assume 2000 if setting not fetched) = Total."
  const total = ticketPrice + platformFee;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Form Area */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Checkout</h1>
            <p className="text-slate-400">Complete your details to finish the registration.</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
            {/* Buyer Details */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 md:p-8">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm font-bold">1</div>
                Your Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                      placeholder="08123456789"
                    />
                  </div>
                </div>

                {/* Dynamic Fields */}
                {event?.formSchema && event.formSchema.length > 0 && (
                  <div className="pt-4 mt-4 border-t border-slate-800 space-y-4">
                    <h3 className="text-md font-medium text-slate-200 mb-4">Additional Information</h3>
                    {event.formSchema.map((field, idx) => (
                      <div key={idx}>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                          {field.label}
                        </label>
                        <input
                          type={field.type === "number" ? "number" : "text"}
                          required
                          value={formData[field.name] || ""}
                          onChange={(e) => handleDynamicChange(field.name, e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                          placeholder={field.label}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 md:p-8">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm font-bold">2</div>
                Payment Method
              </h2>

              {channels.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {channels.map((ch) => (
                    <div
                      key={ch.code}
                      onClick={() => setMethod(ch.code)}
                      className={`relative cursor-pointer rounded-xl border p-4 flex items-center gap-4 transition-all duration-200 ${
                        method === ch.code
                          ? "bg-indigo-500/10 border-indigo-500"
                          : "bg-slate-950 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      {method === ch.code && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                        </div>
                      )}
                      <div className="w-16 h-10 relative bg-white rounded-md p-1 flex-shrink-0">
                        <Image
                          src={ch.icon_url}
                          alt={ch.name}
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-slate-200 text-sm">{ch.name}</p>
                        <p className="text-xs text-slate-500">{ch.group}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500">
                  <p>Loading payment methods...</p>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Sidebar Summary */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 sticky top-8">
            <h3 className="text-lg font-bold text-white mb-6">Order Summary</h3>
            
            {event && (
              <div className="flex gap-4 mb-6 pb-6 border-b border-slate-800">
                <div className="w-16 h-16 bg-slate-800 rounded-xl flex-shrink-0 relative overflow-hidden">
                  {event.bannerUrl ? (
                    <Image src={event.bannerUrl} alt="Event" fill className="object-cover" />
                  ) : (
                    <Calendar className="w-8 h-8 text-slate-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-slate-200 line-clamp-2">{event.title}</h4>
                  <div className="flex items-center gap-1 mt-1 text-slate-500 text-sm">
                    <TicketIcon className="w-4 h-4" />
                    <span>{ticket?.name}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3 mb-6 text-sm">
              <div className="flex justify-between text-slate-300">
                <span>Ticket Price</span>
                <span className="font-medium text-white">
                  {ticketPrice === 0 ? "FREE" : `Rp ${ticketPrice.toLocaleString("id-ID")}`}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Platform Fee</span>
                <span className="font-medium text-white">Rp {platformFee.toLocaleString("id-ID")}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-base font-medium text-slate-200">Total Payment</span>
                <span className="text-2xl font-bold text-emerald-400">
                  Rp {total.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            <button
              type="submit"
              form="checkout-form"
              disabled={submitting}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-4 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                "Pay Now"
              )}
            </button>
            <p className="text-center text-xs text-slate-500 mt-4">
              By proceeding, you agree to our Terms & Conditions
            </p>
          </div>
        </div>
        
      </div>
    </div>
  );
}
