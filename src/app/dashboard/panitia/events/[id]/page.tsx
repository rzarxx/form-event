"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Edit3, Ticket as TicketIcon, FormInput, Plus, Trash2, 
  Save, Loader2, Info, CheckCircle2, AlertCircle, X, Image as ImageIcon
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
  bannerUrl: string | null;
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
  const [bannerUrl, setBannerUrl] = useState("");
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

  // Modals States
  const [successMessage, setSuccessMessage] = useState("");
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
      setBannerUrl(data.bannerUrl || "");
      
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
        body: JSON.stringify({ title, description, bannerUrl }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan detail");
      setSuccessMessage("Detail event berhasil disimpan!");
      fetchEvent();
    } catch (err: any) {
      setSuccessMessage("Error: " + err.message);
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
      setSuccessMessage("Tiket berhasil ditambahkan!");
    } catch (err: any) {
      setSuccessMessage("Error: " + err.message);
    } finally {
      setSavingTicket(false);
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Hapus Tiket",
      message: "Yakin ingin menghapus tiket ini? Aksi ini tidak dapat dibatalkan.",
      onConfirm: async () => {
        setDeletingTicket(ticketId);
        try {
          const res = await fetch(`/api/events/${id}/tickets/${ticketId}`, {
            method: "DELETE",
          });
          if (!res.ok) throw new Error("Gagal menghapus tiket");
          fetchEvent();
          setSuccessMessage("Tiket berhasil dihapus.");
        } catch (err: any) {
          setSuccessMessage("Error: " + err.message);
        } finally {
          setDeletingTicket(null);
        }
      }
    });
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
      setSuccessMessage("Form builder berhasil disimpan!");
      fetchEvent();
    } catch (err: any) {
      setSuccessMessage("Error: " + err.message);
    } finally {
      setSavingForm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center shadow-sm">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-red-700 mb-2">Error</h3>
        <p className="text-red-600">{error || "Event tidak ditemukan"}</p>
        <button
          onClick={() => router.push("/dashboard/panitia/events")}
          className="mt-6 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors font-medium shadow-sm"
        >
          Kembali ke Event
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push("/dashboard/panitia/events")}
            className="p-2 rounded-lg bg-white border border-gray-300 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
            <p className="text-gray-500 text-sm">Manajemen Event</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => {
              const url = `${window.location.origin}/e/${event.id}`;
              navigator.clipboard.writeText(url);
              setSuccessMessage("Link pendaftaran publik berhasil disalin!");
            }}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg shadow-sm transition-colors text-sm font-medium"
          >
            Copy Link
          </button>
          <a
            href={`/e/${event.id}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors text-sm font-medium"
          >
            Lihat Halaman
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-200 pb-px overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("detail")}
          className={`flex items-center px-4 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
            activeTab === "detail"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <Edit3 className="w-4 h-4 mr-2" />
          Detail Event
        </button>
        <button
          onClick={() => setActiveTab("tickets")}
          className={`flex items-center px-4 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
            activeTab === "tickets"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <TicketIcon className="w-4 h-4 mr-2" />
          Tiket ({event.tickets.length})
        </button>
        <button
          onClick={() => setActiveTab("form")}
          className={`flex items-center px-4 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
            activeTab === "form"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <FormInput className="w-4 h-4 mr-2" />
          Form Builder
        </button>
      </div>

      {/* Tab Content: Detail */}
      {activeTab === "detail" && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm ring-1 ring-gray-950/5">
          <form onSubmit={handleUpdateDetail} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Judul Event
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Banner
              </label>
              <div className="flex gap-4 items-start">
                <input
                  type="url"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="https://example.com/banner.jpg"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              {bannerUrl && (
                <div className="mt-4 rounded-lg overflow-hidden border border-gray-200 max-w-md">
                  <img src={bannerUrl} alt="Banner Preview" className="w-full h-auto object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi
              </label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                type="submit"
                disabled={savingDetail}
                className="flex items-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-indigo-500 disabled:opacity-50 shadow-sm"
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
            <h2 className="text-lg font-medium text-gray-900">Daftar Tiket</h2>
            <button
              onClick={() => setIsTicketModalOpen(true)}
              className="flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-indigo-500 shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Tiket
            </button>
          </div>

          {event.tickets.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm ring-1 ring-gray-950/5">
              <TicketIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Tiket</h3>
              <p className="text-gray-500">Buat tiket pertama untuk event Anda.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {event.tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col justify-between shadow-sm ring-1 ring-gray-950/5 hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 truncate pr-2">
                        {ticket.name}
                      </h3>
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                        Aktif
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p className="flex justify-between border-b border-gray-50 pb-1">
                        <span>Harga:</span>
                        <span className="font-medium text-gray-900">
                          Rp {Number(ticket.price).toLocaleString("id-ID")}
                        </span>
                      </p>
                      <p className="flex justify-between border-b border-gray-50 pb-1">
                        <span>Kuota:</span>
                        <span className="font-medium text-gray-900">{ticket.quota}</span>
                      </p>
                      <p className="flex justify-between">
                        <span>Terjual:</span>
                        <span className="font-medium text-gray-900">{ticket.sold}</span>
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                    <button
                      onClick={() => handleDeleteTicket(ticket.id)}
                      disabled={deletingTicket === ticket.id}
                      className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
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
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 flex items-start space-x-3">
            <Info className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
            <div className="text-sm text-indigo-900">
              <p className="font-medium text-indigo-900 mb-1">Kustomisasi Form Pendaftaran</p>
              <p className="text-indigo-700">Tambahkan field yang perlu diisi oleh peserta saat membeli tiket. Nama, Email, dan No. HP sudah diminta secara default oleh sistem, Anda tidak perlu menambahkannya lagi.</p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm ring-1 ring-gray-950/5">
            <div className="space-y-4">
              {formSchema.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  Belum ada field tambahan.
                </div>
              ) : (
                formSchema.map((field, index) => (
                  <div key={index} className="flex flex-col md:flex-row gap-4 items-start md:items-center p-4 rounded-xl border border-gray-200 bg-gray-50">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Label
                        </label>
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => handleUpdateFormField(index, "label", e.target.value)}
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          placeholder="Misal: Asal Instansi"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Name (ID Unik)
                        </label>
                        <input
                          type="text"
                          value={field.name}
                          onChange={(e) => handleUpdateFormField(index, "name", e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          placeholder="Misal: instansi"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Tipe Input
                        </label>
                        <select
                          value={field.type}
                          onChange={(e) => handleUpdateFormField(index, "type", e.target.value)}
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-6 md:mt-0"
                      title="Hapus Field"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}

              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 mt-6 border-t border-gray-100">
                <button
                  onClick={handleAddFormField}
                  className="w-full sm:w-auto flex items-center justify-center rounded-lg bg-white border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Field
                </button>
                
                <button
                  onClick={handleSaveFormSchema}
                  disabled={savingForm}
                  className="w-full sm:w-auto flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition-all hover:bg-indigo-500 shadow-sm disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl ring-1 ring-gray-950/5">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Tambah Tiket Baru</h3>
              <button
                onClick={() => setIsTicketModalOpen(false)}
                className="text-gray-400 hover:text-gray-500 hover:bg-gray-50 p-1.5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Tiket
                </label>
                <input
                  type="text"
                  required
                  value={ticketName}
                  onChange={(e) => setTicketName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Misal: Regular Pass"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Harga (Rp)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={ticketPrice}
                  onChange={(e) => setTicketPrice(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Misal: 50000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kuota
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={ticketQuota}
                  onChange={(e) => setTicketQuota(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Misal: 100"
                />
              </div>

              <div className="mt-6 flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTicketModalOpen(false)}
                  className="flex-1 rounded-lg bg-white border border-gray-300 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingTicket}
                  className="flex-1 flex items-center justify-center rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white transition-all hover:bg-indigo-500 shadow-sm disabled:opacity-50"
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

      {/* Confirm Modal */}
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

      {/* Success/Error Modal */}
      {successMessage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl ring-1 ring-gray-950/5 text-center">
            <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${successMessage.startsWith('Error') ? 'bg-red-100' : 'bg-green-100'}`}>
              {successMessage.startsWith('Error') ? (
                <AlertCircle className="w-6 h-6 text-red-600" />
              ) : (
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {successMessage.startsWith('Error') ? 'Gagal' : 'Berhasil'}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {successMessage.startsWith('Error') ? successMessage.substring(7) : successMessage}
            </p>
            <button
              onClick={() => setSuccessMessage("")}
              className="w-full px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition-colors shadow-sm"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
