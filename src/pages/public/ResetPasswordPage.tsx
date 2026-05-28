import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../services/auth.service";
import { toast } from "react-hot-toast";

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") || "";
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    async function submit(e: any) {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Password dan konfirmasi password tidak cocok!");
            return;
        }

        if (password.length < 8) {
            toast.error("Password minimal harus 8 karakter!");
            return;
        }

        if (!token) {
            toast.error("Token reset password tidak ditemukan!");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            await resetPassword({ token, password });
            toast.success("Password berhasil diperbarui! Silakan login kembali.");
            setTimeout(() => {
                navigate("/login");
            }, 3000);
            setMessage("Password berhasil diperbarui! Anda akan diarahkan ke halaman login dalam 3 detik...");
        } catch (err: any) {
            console.error(err);
            const errorMsg = err.response?.data?.message || err.message || "Gagal mereset password.";
            toast.error(errorMsg);
            setMessage(`Gagal: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    }

    if (!token) {
        return (
            <div className="min-h-screen flex justify-center items-center p-4 bg-gradient-to-br from-indigo-100 via-blue-50 to-white relative overflow-hidden font-sans pt-28 pb-12">
                <div className="bg-white/90 backdrop-blur-xl shadow-xl border border-slate-100 rounded-[3rem] p-8 md:p-12 w-full max-w-md relative z-10 text-center">
                    <div className="w-24 h-24 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center text-5xl mx-auto mb-8 shadow-inner">⚠️</div>
                    <h1 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">Invalid Token</h1>
                    <p className="text-slate-500 font-semibold text-sm mb-8 leading-relaxed">
                        Token reset password tidak ditemukan atau tidak valid. Silakan ajukan kembali reset password Anda.
                    </p>
                    <Link to="/forgot-password" className="inline-block bg-indigo-600 text-white font-black px-8 py-3 rounded-full hover:-translate-y-0.5 transition-all shadow-md">
                        Kembali ke Lupa Password
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex justify-center items-center p-4 bg-gradient-to-br from-indigo-100 via-blue-50 to-white relative overflow-hidden font-sans pt-28 pb-12">

            {/* Background decorations */}
            <div className="absolute top-10 right-10 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" style={{ animationDelay: '2s' }}></div>

            {/* Card Form */}
            <div className="bg-white/90 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white rounded-[3rem] p-8 md:p-12 w-full max-w-md relative z-10 text-center">

                <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-5xl mx-auto mb-8 shadow-inner">🔐</div>

                <h1 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">Reset Password</h1>
                <p className="text-slate-500 font-semibold text-sm mb-8 leading-relaxed">
                    Masukkan password baru Anda untuk memulihkan akses akun WordIT.
                </p>

                <form onSubmit={submit} className="space-y-6 text-left">
                    <div className="w-full flex flex-col gap-2">
                        <label className="text-sm font-bold text-slate-700 ml-2">Password Baru</label>
                        <input
                            type="password"
                            placeholder="Password minimal 8 karakter"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                            className="w-full bg-slate-50 text-slate-800 px-6 py-4 rounded-full border-2 border-slate-100 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all font-semibold disabled:opacity-50"
                        />
                    </div>

                    <div className="w-full flex flex-col gap-2">
                        <label className="text-sm font-bold text-slate-700 ml-2">Konfirmasi Password Baru</label>
                        <input
                            type="password"
                            placeholder="Masukkan ulang password baru"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={loading}
                            className="w-full bg-slate-50 text-slate-800 px-6 py-4 rounded-full border-2 border-slate-100 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all font-semibold disabled:opacity-50"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white font-black text-lg py-4 rounded-full shadow-[0_8px_20px_rgba(79,70,229,0.3)] hover:-translate-y-1 hover:shadow-lg transition-all active:scale-95 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                    >
                        {loading ? "Updating..." : "Reset Password"}
                    </button>
                </form>

                {message && (
                    <div className={`mt-6 p-4 rounded-2xl font-bold text-sm animate-fade-in-up text-center border ${
                        message.startsWith("Gagal") 
                            ? "bg-rose-50 text-rose-600 border-rose-100" 
                            : "bg-emerald-50 text-emerald-600 border-emerald-100"
                    }`}>
                        {message.startsWith("Gagal") ? "❌" : "✅"} {message}
                    </div>
                )}

                <div className="mt-8 pt-6 border-t border-slate-100">
                    <Link to="/login" className="text-slate-500 font-bold hover:text-indigo-600 transition-colors flex items-center justify-center gap-2">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
