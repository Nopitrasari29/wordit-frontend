import { useAuth } from "../../hooks/useAuth"
import { Link } from "react-router-dom"

export default function ProfilePage() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="font-bold text-slate-500 animate-pulse">Memuat Profil...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">

      {/* HEADER BANNER & AVATAR */}
      <div className="relative mb-24">
        {/* Banner */}
        <div className="h-48 md:h-64 bg-gradient-to-r from-indigo-500 to-blue-400 rounded-b-[3rem] md:rounded-b-[4rem] shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
        </div>

        {/* Floating Avatar */}
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-16">
          <img
            src={user?.photoUrl || "/avatar.png"}
            alt="Profile Avatar"
            className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-8 border-slate-50 shadow-xl bg-white"
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 text-center">

        {/* INFO PENGGUNA */}
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-2">
          {user?.name}
        </h1>
        <p className="text-slate-500 font-bold mb-4 text-lg">
          {user?.email}
        </p>

        <div className="flex justify-center mb-10">
          <span className="bg-indigo-100 text-indigo-700 px-6 py-2 rounded-full font-black text-sm tracking-widest uppercase">
            {user?.role}
          </span>
        </div>

        <Link
          to="/profile/edit"
          className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-black px-10 py-3.5 rounded-full shadow-[0_8px_20px_rgba(79,70,229,0.3)] hover:-translate-y-1 transition-all active:scale-95 mb-12"
        >
          Edit Profile
        </Link>

        {/* GRID MENU */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">

          <Link
            to="/teacher/projects"
            className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group flex flex-col"
          >
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
              📁
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">
              My Projects
            </h3>
            <p className="text-slate-500 font-bold">
              Manage created games and activities
            </p>
          </Link>

          <Link
            to="/student/dashboard"
            className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group flex flex-col"
          >
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
              📊
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">
              My Results
            </h3>
            <p className="text-slate-500 font-bold">
              View your game history and scores
            </p>
          </Link>

        </div>

      </div>
    </div>
  )
}