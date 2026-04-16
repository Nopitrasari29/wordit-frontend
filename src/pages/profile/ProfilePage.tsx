import { useAuth } from "../../hooks/useAuth"
import { Link } from "react-router-dom"

export default function ProfilePage() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 pt-28">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="font-bold text-slate-500 animate-pulse text-sm">Memuat Profil...</p>
      </div>
    )
  }

  return (
    // min-h-screen dan bg-white/gradient agar background penuh ke pinggir
    <div className="min-h-screen bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900 pt-28 pb-20 relative overflow-hidden">

      {/* Dekorasi Background Blob Lembut (Mirip Edit Profile) */}
      <div className="absolute top-20 -left-10 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-60 animate-blob"></div>
      <div className="absolute top-60 -right-10 w-96 h-96 bg-cyan-50 rounded-full blur-3xl opacity-60 animate-blob" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">

        {/* AVATAR SECTION (Bersih tanpa banner ungu) */}
        <div className="flex flex-col items-center gap-6 mb-12">
          <div className="relative group">
            <img
              src={user?.photoUrl || "/avatar.png"}
              alt="Profile Avatar"
              className="w-40 h-40 md:w-48 md:h-48 rounded-full object-cover border-8 border-white shadow-2xl bg-slate-50 transition-all group-hover:scale-105"
            />
            <div className="absolute -bottom-2 -right-2 bg-indigo-600 w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-lg border-4 border-white">👤</div>
          </div>
          <div className="flex justify-center">
            <span className="bg-white/70 backdrop-blur-sm border border-slate-200 text-slate-600 px-6 py-2 rounded-full font-black text-xs tracking-widest uppercase">
              {user?.role}
            </span>
          </div>
        </div>

        {/* INFO PENGGUNA */}
        <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-2 tracking-tight">
          {user?.name}
        </h1>
        <p className="text-slate-500 font-bold mb-10 text-lg leading-relaxed">
          {user?.email}
        </p>

        <Link
          to="/profile/edit"
          className="inline-block bg-slate-950 text-white font-black px-12 py-4 rounded-full shadow-lg shadow-slate-200 hover:bg-indigo-600 hover:-translate-y-1 transition-all active:scale-95 mb-16"
        >
          Edit Profile ⚙️
        </Link>

        {/* GRID MENU (Value Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          {/* Project Card */}
          <Link
            to="/teacher/projects"
            className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group flex flex-col"
          >
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
              📁
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight leading-tight">
              My Projects
            </h3>
            <p className="text-slate-500 font-semibold text-sm leading-relaxed text-balance">
              Manage your created games, education activities, and resources.
            </p>
          </Link>

          {/* Result Card */}
          <Link
            to="/student/dashboard"
            className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group flex flex-col"
          >
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
              📊
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight leading-tight">
              My Results
            </h3>
            <p className="text-slate-500 font-semibold text-sm leading-relaxed text-balance">
              View your game history, achievement scores, and learning progress.
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}