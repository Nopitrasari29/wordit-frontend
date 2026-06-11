import { useSearchParams, Link } from "react-router-dom";

export default function VerifyPendingPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "email Anda";

  return (
    <div className="min-h-screen flex justify-center items-center p-4 bg-gradient-to-br from-indigo-100 via-blue-50 to-white relative overflow-hidden font-sans pt-28 pb-12">
      {/* Background decorations */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div
        className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"
        style={{ animationDelay: "2s" }}
      ></div>

      <div className="bg-white/90 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white rounded-[3rem] p-8 md:p-12 w-full max-w-md relative z-10 text-center">
        {/* Animated Icon */}
        <div className="w-24 h-24 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-5xl mx-auto mb-8 shadow-inner animate-pulse">
          📧
        </div>

        {/* Title */}
        <h1 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">
          Periksa Email Anda
        </h1>

        {/* Description */}
        <p className="text-slate-500 font-semibold text-sm mb-6 leading-relaxed">
          Kami telah mengirimkan tautan verifikasi ke email: <br />
          <span className="text-indigo-600 font-bold text-base block mt-2 break-all bg-indigo-50/50 py-2 px-4 rounded-xl border border-indigo-100/50">{email}</span>
        </p>

        <p className="text-slate-400 text-xs font-medium mb-8 leading-relaxed">
          Silakan periksa kotak masuk email Anda dan klik tautan tersebut untuk memverifikasi akun sebelum masuk ke aplikasi. <br />
          <span className="font-bold text-amber-500 block mt-2">⚠️ Jika tidak ada, mohon periksa folder Spam atau Promosi.</span>
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <a
            href="https://mail.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full"
          >
            <button className="w-full font-black text-sm py-4 rounded-full bg-indigo-600 text-white shadow-[0_8px_20px_rgba(79,70,229,0.2)] hover:bg-indigo-500 transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer">
              Buka Gmail
            </button>
          </a>
          
          <Link to="/login" className="block w-full">
            <button className="w-full font-bold text-sm py-4 rounded-full border-2 border-slate-100 hover:bg-slate-50 text-slate-600 transition-all active:scale-95 cursor-pointer">
              Kembali ke Login
            </button>
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider">
            WordIT Verification System
          </p>
        </div>
      </div>
    </div>
  );
}
