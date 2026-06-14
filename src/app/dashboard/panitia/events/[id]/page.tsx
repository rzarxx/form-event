"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Edit3, Ticket, FormInput, Plus, Trash2, 
  Save, Loader2, Info, CheckCircle2, AlertCircle, X
} from "lucide-react";

interface TicketData {
  id: string;
  name: string;
  price: number;
  quota: number;
  sold: number;
}

interface FormField {
  name: string;
  label: string;
  type: string;
}

interface EventData {
  id: string;
  title: string;
  description: string;
  formSchema: FormField[] | null;
  tickets: TicketData[];
}

export default function EventManagementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"detail" | "tickets" | "form">("detail");

  // Detailed Tab States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [savingDetail, setSavingDetail] = useState(false);

  // Tickets Tab States
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [ticketName, setTicketName] = useState("");
  const [ticketPrice, setTicketPrice] = useState("");
  const [ticketQuota, setTicketQuota] = useState("");
  const [savingTicket, setSavingTicket] = useState(false);
  const [deletingTicket, setDeletingTicket] = useState<string | null>(null);

  // Form Builder Tab States
  const [formSchema, setFormSchema] = useState<FormField[]>([]);
  const [savingForm, setSavingForm] = useState(false);

  const fetchEvent = async () => {
    try {
      const res = await fetch(`/api/events/${id}`);
      if (!res.ok) {
        throw new Error("Gagal memuat detail event");
      }
      const data = await res.json();
      setEvent(data);
      setTitle(data.title);
      setDescription(data.description || "");
      
      let parsedSchema: FormField[] = [];
      if (Array.isArray(data.formSchema)) {
        parsedSchema = data.formSchema;
      } else if (typeof data.formSchema === "string") {
        try {
          parsedSchema = JSON.parse(data.formSchema);
        } catch (e) {
          // Ignore
        }
      }
      setFormSchema(parsedSchema);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const handleUpdateDetail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingDetail(true);
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan detail");
      alert("Detail berhasil disimpan!");
      fetchEvent();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingDetail(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTicket(true);
    try {
      const res = await fetch(`/api/events/${id}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: ticketName,
          price: Number(ticketPrice),
          quota: Number(ticketQuota),
        }),
      });
      if (!res.ok) throw new Error("Gagal membuat tiket");
      setIsTicketModalOpen(false);
      setTicketName("");
      setTicketPrice("");
      setTicketQuota("");
      fetchEvent();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingTicket(false);
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (!confirm("Yakin ingin menghapus tiket ini?")) return;
    setDeletingTicket(ticketId);
    try {
      const res = await fetch(`/api/events/${id}/tickets/${ticketId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Gagal menghapus tiket");
      fetchEvent();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeletingTicket(null);
    }
  };

  const handleAddFormField = () => {
    setFormSchema([
      ...formSchema,
      { name: `field_${Date.now()}`, label: "Label Baru", type: "text" },
    ]);
  };

  const handleRemoveFormField = (index: number) => {
    const newSchema = [...formSchema];
    newSchema.splice(index, 1);
    setFormSchema(newSchema);
  };

  const handleUpdateFormField = (index: number, key: keyof FormField, value: string) => {
    const newSchema = [...formSchema];
    newSchema[index][key] = value;
    setFormSchema(newSchema);
  };

  const handleSaveFormSchema = async () => {
    setSavingForm(true);
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formSchema }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan form");
      alert("Form builder berhasil disimpan!");
      fetchEvent();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingForm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-red-500 mb-2">Error</h3>
        <p className="text-slate-400">{error || "Event tidak ditemukan"}</p>
        <button
          onClick={() => router.push("/dashboard/panitia/events")}
          className="mt-6 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors"
        >
          Kembali ke Event
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.push("/dashboard/panitia/events")}
          className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">{event.title}</h1>
          <p className="text-slate-400">Manajemen Event</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-px overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("detail")}
          className={`flex items-center px-4 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
            activeTab === "detail"
              ? "border-indigo-500 text-indigo-400"
              : "border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-700"
          }`}
        >
          <Edit3 className="w-4 h-4 mr-2" />
          Detail Event
        </button>
        <button
          onClick={() => setActiveTab("tickets")}
          className={`flex items-center px-4 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
            activeTab === "tickets"
              ? "border-indigo-500 text-indigo-400"
              : "border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-700"
          }`}
        >
          <Ticket className="w-4 h-4 mr-2" />
          Tiket ({event.tickets.length})
        </button>
        <button
          onClick={() => setActiveTab("form")}
          className={`flex items-center px-4 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
            activeTab === "form"
              ? "border-indigo-500 text-indigo-400"
              : "border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-700"
          }`}
        >
          <FormInput className="w-4 h-4 mr-2" />
          Form Builder
        </button>
      </div>

      {/* Tab Content: Detail */}
      {activeTab === "detail" && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
          <form onSubmit={handleUpdateDetail} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Judul Event
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Deskripsi
              </label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingDetail}
                className="flex items-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-indigo-700 disabled:opacity-50"
              >
                {savingDetail ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Save className="w-5 h-5 mr-2" />
                )}
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab Content: Tickets */}
      {activeTab === "tickets" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-white">Daftar Tiket</h2>
            <button
              onClick={() => setIsTicketModalOpen(true)}
              className="flex items-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Tiket
            </button>
          </div>

          {event.tickets.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center backdrop-blur-sm">
              <Ticket className="mx-auto h-12 w-12 text-slate-600 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Belum Ada Tiket</h3>
              <p className="text-slate-400">Buat tiket pertama untuk event Anda.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {event.tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col justify-between backdrop-blur-sm"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-white truncate pr-2">
                        {ticket.name}
                      </h3>
                      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                        Aktif
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-slate-400">
                      <p className="flex justify-between">
                        <span>Harga:</span>
                        <span className="font-medium text-white">
                          Rp {Number(ticket.price).toLocaleString("id-ID")}
                        </span>
                      </p>
                      <p className="flex justify-between">
                        <span>Kuota:</span>
                        <span className="font-medium text-white">{ticket.quota}</span>
                      </p>
                      <p className="flex justify-between">
                        <span>Terjual:</span>
                        <span className="font-medium text-white">{ticket.sold}</span>
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
                    <button
                      onClick={() => handleDeleteTicket(ticket.id)}
                      disabled={deletingTicket === ticket.id}
                      className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50"
                      title="Hapus Tiket"
                    >
                      {deletingTicket === ticket.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Form Builder */}
      {activeTab === "form" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-4 flex items-start space-x-3">
            <Info className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
            <div className="text-sm text-indigo-200">
              <p className="font-medium text-indigo-300 mb-1">Kustomisasi Form Pendaftaran</p>
              <p>Tambahkan field yang perlu diisi oleh peserta saat membeli tiket. Nama, Email, dan No. HP sudah diminta secara default oleh sistem, Anda tidak perlu menambahkannya lagi.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
            <div className="space-y-4">
              {formSchema.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  Belum ada field tambahan.
                </div>
              ) : (
                formSchema.map((field, index) => (
                  <div key={index} className="flex flex-col md:flex-row gap-4 items-start md:items-center p-4 rounded-xl border border-slate-800 bg-slate-900">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                          Label
                        </label>
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => handleUpdateFormField(index, "label", e.target.value)}
                          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                          placeholder="Misal: Asal Instansi"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                          Name (ID Unik)
                        </label>
                        <input
                          type="text"
                          value={field.name}
                          onChange={(e) => handleUpdateFormField(index, "name", e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                          placeholder="Misal: instansi"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                          Tipe Input
                        </label>
                        <select
                          value={field.type}
                          onChange={(e) => handleUpdateFormField(index, "type", e.target.value)}
                          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                        >
                          <option value="text">Teks Pendek</option>
                          <option value="email">Email</option>
                          <option value="number">Angka</option>
                          <option value="select">Pilihan Dropdown</option>
                        </select>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveFormField(index)}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors mt-6 md:mt-0"
                      title="Hapus Field"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}

              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 mt-6 border-t border-slate-800">
                <button
                  onClick={handleAddFormField}
                  className="w-full sm:w-auto flex items-center justify-center rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-slate-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Field
                </button>
                
                <button
                  onClick={handleSaveFormSchema}
                  disabled={savingForm}
                  className="w-full sm:w-auto flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-indigo-700 disabled:opacity-50"
                >
                  {savingForm ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <Save className="w-5 h-5 mr-2" />
                  )}
                  Simpan Form
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Creation Modal */}
      {isTicketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Tambah Tiket Baru</h3>
              <button
                onClick={() => setIsTicketModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Nama Tiket
                </label>
                <input
                  type="text"
                  required
                  value={ticketName}
                  onChange={(e) => setTicketName(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Misal: Regular Pass"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Harga (Rp)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={ticketPrice}
                  onChange={(e) => setTicketPrice(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Misal: 50000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Kuota
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={ticketQuota}
                  onChange={(e) => setTicketQuota(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Misal: 100"
                />
              </div>

              <div className="mt-6 flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTicketModalOpen(false)}
                  className="flex-1 rounded-xl bg-slate-800 py-3 text-sm font-medium text-white transition-all hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingTicket}
                  className="flex-1 flex items-center justify-center rounded-xl bg-indigo-600 py-3 text-sm font-medium text-white transition-all hover:bg-indigo-700 disabled:opacity-50"
                >
                  {savingTicket ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Simpan Tiket"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
