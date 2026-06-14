"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import Link from "next/link";

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone");

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      setError("Nomor telepon tidak ditemukan. Silakan daftar ulang.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal melakukan verifikasi OTP");
      }

      setSuccess("Verifikasi berhasil! Mengalihkan ke halaman login...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Verifikasi OTP</h1>
        <p className="text-sm text-gray-500 mt-2">
          Masukkan 6 digit kode OTP yang telah dikirimkan ke WhatsApp Anda{phone ? ` (${phone})` : ""}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-600">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5 text-center">
            Kode OTP
          </label>
          <input
            type="text"
            required
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors text-center text-2xl tracking-[0.5em] font-medium text-gray-900"
            placeholder="••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading || otp.length !== 6 || !!success}
          className={`w-full py-2.5 px-4 rounded-xl text-white font-medium bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center justify-center ${(loading || otp.length !== 6 || success) ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Memverifikasi...
            </>
          ) : (
            "Verifikasi"
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Belum menerima kode?{" "}
        <button type="button" className="text-indigo-600 hover:text-indigo-700 font-medium">
          Kirim Ulang
        </button>
      </p>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Suspense fallback={<div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>}>
        <VerifyForm />
      </Suspense>
    </div>
  );
}
