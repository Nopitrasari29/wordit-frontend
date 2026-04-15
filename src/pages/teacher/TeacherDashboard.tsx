import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { getMyGames } from "../services/game.service"
import { dummyTeacherGames } from "../../data/dummyTeacherGames"
import AnalyticsClassPage from "./analytics/AnalyticsClassPage"

export default function TeacherDashboard() {
  const [games, setGames] = useState<any[]>([])

  useEffect(() => {
    async function loadGames() {
      try {
        const data = await getMyGames()
        if (data && data.length > 0) {
          setGames(data)
        } else {
          setGames(dummyTeacherGames)
        }
      } catch {
        setGames(dummyTeacherGames)
      }
    }
    loadGames()
  }, [])

  const totalPlays = games.reduce((a, g) => a + (g.playCount || 0), 0)
  const publishedGames = games.filter(g => g.isPublished).length

  return (
    <div className="space-y-10 font-sans pb-12 pt-6">

      {/* ================= HEADER BANNER ================= */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-[2.5rem] p-8 md:p-12 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-5xl font-black mb-3">
              Teacher Dashboard 👋
            </h1>
            <p className="text-indigo-100 font-semibold text-lg leading-relaxed">
              Selamat datang! Kelola materi pembelajaran interaktifmu dan pantau progres kelas dalam satu dashboard cerdas.
            </p>
          </div>
          <Link
            to="/teacher/create/level"
            className="bg-white text-indigo-600 px-10 py-5 rounded-[2rem] font-black text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
          >
            + Buat Game Baru
          </Link>
        </div>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50 flex items-center gap-5 hover:-translate-y-1 transition-all duration-300 group">
          <div className="w-16 h-16 shrink-0 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">🕹️</div>
          <div>
            <p className="text-slate-500 font-bold text-sm mb-1 uppercase tracking-widest">Games Created</p>
            <h2 className="text-3xl font-black text-slate-800">{games.length}</h2>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50 flex items-center gap-5 hover:-translate-y-1 transition-all duration-300 group">
          <div className="w-16 h-16 shrink-0 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl group-hover:bg-blue-600 group-hover:text-white transition-colors">🎮</div>
          <div>
            <p className="text-slate-500 font-bold text-sm mb-1 uppercase tracking-widest">Total Plays</p>
            <h2 className="text-3xl font-black text-slate-800">{totalPlays}</h2>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50 flex items-center gap-5 hover:-translate-y-1 transition-all duration-300 group">
          <div className="w-16 h-16 shrink-0 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center text-3xl group-hover:bg-green-600 group-hover:text-white transition-colors">✅</div>
          <div>
            <p className="text-slate-500 font-bold text-sm mb-1 uppercase tracking-widest">Published</p>
            <h2 className="text-3xl font-black text-slate-800">{publishedGames}</h2>
          </div>
        </div>
      </div>

      {/* ================= CLASS ANALYTICS ================= */}
      <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-50">
        <div className="mb-8 px-2">
          <h2 className="text-2xl font-black text-slate-800 italic underline decoration-indigo-200 underline-offset-8">
            Analitik Performa Kelas
          </h2>
        </div>
        <AnalyticsClassPage games={games} />
      </div>

      {/* ================= MY GAMES PREVIEW ================= */}
      <div>
        <div className="flex justify-between items-center mb-8 px-4">
          <h2 className="text-2xl font-black text-slate-800">
            Recent Projects 📂
          </h2>
          <Link to="/teacher/projects" className="text-indigo-600 font-black hover:underline tracking-tight">Lihat Semua Projek ➔</Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 px-2">
          {games.slice(0, 3).map(game => (
            <div
              key={game.id}
              className="bg-white p-6 rounded-[2.5rem] shadow-sm hover:shadow-2xl border border-slate-100 transition-all duration-300 hover:-translate-y-2 flex flex-col relative overflow-hidden"
            >
              <div className="bg-slate-50 rounded-[2rem] h-40 mb-6 flex items-center justify-center text-5xl shadow-inner group">
                <span className="group-hover:scale-125 transition-transform duration-300">🧩</span>
              </div>

              <h3 className="text-xl font-black text-slate-800 mb-2 truncate">
                {game.title}
              </h3>

              <div className="flex items-center gap-2 mb-6">
                <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {game.templateType}
                </span>
                <span className="text-slate-400 font-bold text-xs">
                  • {game.educationLevel}
                </span>
              </div>

              <div className="mt-auto pt-5 border-t border-slate-50 flex items-center justify-between font-sans">
                <p className="text-sm font-bold text-slate-400">
                  <span className="text-indigo-600 font-black">{game.playCount}</span> plays
                </p>
                <Link
                  to={`/teacher/game/edit/${game.id}`}
                  className="bg-slate-900 text-white px-5 py-2 rounded-full text-xs font-black hover:bg-indigo-600 transition-colors"
                >
                  EDIT
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}