"use client";

import { useEffect, useState } from "react";
import { Loader2, ArrowUpDown, Search, Receipt } from "lucide-react";
import { motion } from "framer-motion";

interface Transaction {
  id: string;
  type: "TICKET" | "SUBSCRIPTION";
  reference: string;
  buyerName: string;
  buyerEmail: string;
  itemName: string;
  amount: number;
  status: string;
  method: string;
  createdAt: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("/api/admin/transactions")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setTransactions(data.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching transactions", err);
        setLoading(false);
      });
  }, []);

  const filteredTransactions = transactions.filter(
    (tx) =>
      tx.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.buyerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Receipt className="h-6 w-6 text-indigo-600" />
            Semua Transaksi
          </h1>
          <p className="text-gray-500 mt-1">
            Pantau riwayat pembayaran tiket dan langganan secara realtime.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari referensi, nama..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-2">
                    Referensi <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-6 py-4">Pembeli</th>
                <th className="px-6 py-4">Item (Tipe)</th>
                <th className="px-6 py-4">Metode</th>
                <th className="px-6 py-4">Jumlah</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 text-sm">Memuat data transaksi...</p>
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500 text-sm">
                    Tidak ada transaksi ditemukan.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={tx.id}
                    className="hover:bg-gray-50 transition-colors text-sm"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-gray-900">
                      {tx.reference}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{tx.buyerName}</div>
                      <div className="text-gray-500 text-xs">{tx.buyerEmail}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{tx.itemName}</div>
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                          tx.type === "TICKET"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{tx.method}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      Rp {tx.amount.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                          tx.status === "SUCCESS" || tx.status === "PAID"
                            ? "bg-emerald-100 text-emerald-700"
                            : tx.status === "PENDING" || tx.status === "UNPAID"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {new Date(tx.createdAt).toLocaleString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
