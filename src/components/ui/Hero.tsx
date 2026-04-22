import { Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

export default function Hero() {
  const { user } = useAuth()

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-white pt-20">

      {/* BACKGROUND BLOBS */}
      <div className="absolute top-20 -left-10 w-72 h-72 bg-indigo-200 rounded-full blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-10 -right-10 w-72 h-72 bg-blue-200 rounded-full blur-3xl opacity-30 animate-blob" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        {/* HYBRID BADGE */}
        <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-full mb-8">
          <span className="bg-indigo-600 w-2 h-2 rounded-full animate-ping"></span>
          <span className="text-slate-600 font-black text-[10px] uppercase tracking-widest">LMS Integrated Platform</span>
        </div>

        {/* MAIN TITLE - Ukuran dikecilkan agar proporsional */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-tight mb-8">
          The Future of <br />
          <span className="bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent animate-text-gradient italic">
            Connected Education
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-slate-500 font-bold text-lg md:text-xl leading-relaxed mb-12">
          Ciptakan pengalaman belajar interaktif yang terhubung langsung dengan Moodle Classroom atau eksplorasi galeri publik.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to={user?.role === "TEACHER" ? "/teacher/dashboard" : "/register"} className="bg-indigo-600 text-white px-8 py-4 rounded-full font-black text-lg shadow-xl shadow-indigo-100 hover:-translate-y-1 transition-all">
            Mulai Buat Game 🚀
          </Link>
          <Link to="/explore" className="bg-white text-slate-700 border-2 border-slate-100 px-8 py-4 rounded-full font-black text-lg hover:bg-slate-50 transition-all">
            Eksplor Galeri 🌐
          </Link>
        </div>
      </div>

      {/* WAVE TRANSITION - Memastikan transisi ke section bawah mulus */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[60px] md:h-[100px]">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C49.1,15.1,104.13,32,165,42.26,220.44,51.62,271.39,57.44,321.39,56.44Z" fill="#f8fafc"></path>
        </svg>
      </div>
    </div>
  )
}