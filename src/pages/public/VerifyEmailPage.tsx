import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get("token");

        if (!token) {
          setMessage("Token verifikasi tidak ditemukan.");
          setLoading(false);
          return;
        }

        const apiUrl = (import.meta as unknown as { env: { VITE_API_URL: string } }).env.VITE_API_URL;
        const response = await fetch(
          `${apiUrl}/api/auth/verify-email?token=${token}`
        );

        const data = await response.json();

        if (response.ok) {
          setSuccess(true);
          setMessage(data.message || "Email berhasil diverifikasi.");
        } else {
          setMessage(data.message || "Verifikasi gagal.");
        }
      } catch (error) {
        setMessage("Terjadi kesalahan saat verifikasi.");
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams]);

    return (
        <div className="min-h-screen flex justify-center items-center p-4 bg-gradient-to-br from-indigo-100 via-blue-50 to-white relative overflow-hidden font-sans pt-28 pb-12">

            {/* Background decorations */}
            <div className="absolute top-10 right-10 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div
                className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"
                style={{ animationDelay: "2s" }}
            ></div>

            <div className="bg-white/90 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white rounded-[3rem] p-8 md:p-12 w-full max-w-md relative z-10 text-center">

                {/* Icon */}
                <div
                    className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl mx-auto mb-8 shadow-inner ${
                        loading
                            ? "bg-indigo-50 text-indigo-600"
                            : success
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-rose-50 text-rose-600"
                    }`}
                >
                    {loading ? "⏳" : success ? "✅" : "❌"}
                </div>

                {/* Title */}
                <h1 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">
                    {loading
                        ? "Memverifikasi Email"
                        : success
                        ? "Email Terverifikasi"
                        : "Verifikasi Gagal"}
                </h1>

                {/* Description */}
                <p className="text-slate-500 font-semibold text-sm mb-8 leading-relaxed">
                    {loading
                        ? "Mohon tunggu, kami sedang memverifikasi email Anda."
                        : message}
                </p>

                {/* Button */}
                {!loading && (
                    <Link
                        to="/login"
                        className="inline-block w-full"
                    >
                        <button
                            className={`w-full font-black text-lg py-4 rounded-full transition-all active:scale-95 ${
                                success
                                    ? "bg-emerald-600 text-white shadow-[0_8px_20px_rgba(16,185,129,0.3)] hover:-translate-y-1"
                                    : "bg-indigo-600 text-white shadow-[0_8px_20px_rgba(79,70,229,0.3)] hover:-translate-y-1"
                            }`}
                        >
                            Login
                        </button>
                    </Link>
                )}

                {/* Footer */}
                {!loading && (
                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <p className="text-slate-400 text-sm font-semibold">
                            WordIT Email Verification
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}