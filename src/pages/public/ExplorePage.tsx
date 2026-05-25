import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { getGames } from "../services/game.service"
import { templateIcons } from "../../data/templateIcons"
// Note: Kalau GameCard sudah ada, bisa dipakai. Di kode kamu ini kamu mapping div, jadi saya modif div mapping-nya.
// import GameCard from "../../components/game/common/GameCard"


export default function ExplorePage() {
  const [games, setGames] = useState<any[]>([])
  const [level, setLevel] = useState<string>("ALL")
  const [loading, setLoading] = useState(true)

  async function loadGames(levelFilter?: string) {
    try {
      const params: any = {}
      if (levelFilter && levelFilter !== "ALL") {
        params.educationLevel = levelFilter
      }
      const data = await getGames(params)

      if (data && Array.isArray(data)) {
        setGames(data)
      } else {
        setGames([])
      }
    } catch (err) {
      console.error("Gagal memuat game:", err)
      setGames([])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadGames()
  }, [])

  function filterLevel(lvl: string) {
    setLevel(lvl)
    loadGames(lvl)
  }



  return (
    <div className="min-h-screen font-sans pb-24">

      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-[2.5rem] p-8 md:p-12 text-white shadow-xl shadow-indigo-200 mb-10 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
        <h1 className="text-4xl md:text-5xl font-black mb-3 relative z-10 tracking-tight">
          Eksplor Games 🚀
        </h1>
        <p className="text-indigo-100 font-semibold text-lg relative z-10">
          Temukan dan mainkan ribuan kuis seru buatan guru di sini.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-0">
        {/* FILTER BUTTONS */}
        <div className="flex gap-3 flex-wrap mb-10">
          {["SD", "SMP", "SMA", "UNIVERSITY", "ALL"].map(lvl => (
            <button
              key={lvl}
              onClick={() => filterLevel(lvl)}
              className={`px-6 py-3 rounded-full font-bold transition-all duration-300 shadow-sm ${level === lvl
                  ? "bg-indigo-600 text-white shadow-[0_8px_20px_rgba(79,70,229,0.3)] -translate-y-1"
                  : "bg-white text-slate-600 border border-slate-100 hover:bg-indigo-50 hover:text-indigo-600"
                }`}
            >
              {lvl === "ALL" ? "Semua Level" : lvl}
            </button>
          ))}
        </div>

        {/* GAME LIST */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {loading ? (
            Array(6).fill(null).map((_, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-[2rem] border border-slate-100 flex flex-col animate-pulse"
              >
                <div className="bg-slate-100 h-32 rounded-[1.5rem] mb-6"></div>
                <div className="h-6 bg-slate-200 rounded-md mb-3 w-3/4"></div>
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-5 bg-slate-100 rounded-full w-20"></div>
                  <div className="h-5 bg-slate-100 rounded-full w-12"></div>
                </div>
                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="h-4 bg-slate-100 rounded-md w-24"></div>
                  <div className="h-6 bg-slate-100 rounded-full w-16"></div>
                </div>
              </div>
            ))
          ) : games.length === 0 ? (
            <div className="col-span-full bg-white p-12 rounded-[2.5rem] border border-slate-100 text-center shadow-sm">
              <span className="text-5xl mb-4 block">🔍</span>
              <h3 className="text-xl font-black text-slate-800">Tidak Ada Game Tersedia</h3>
              <p className="text-slate-400 font-bold text-sm mt-2">Belum ada game yang dipublikasikan untuk kategori ini.</p>
            </div>
          ) : (
            games.map(game => (
              <Link
                key={game.id}
                to={`/play/${game.id}`}
                className="bg-white p-6 rounded-[2rem] shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300 hover:-translate-y-2 cursor-pointer flex flex-col group text-left"
              >
                {/* BIG ICON AREA */}
                <div className="bg-slate-100 h-32 rounded-[1.5rem] mb-6 flex items-center justify-center text-5xl group-hover:scale-105 transition-transform duration-300">
                  {templateIcons[game.templateType] || "🎮"}
                </div>

                {/* TITLE */}
                <h2 className="font-black text-xl text-slate-800 mb-3 truncate">
                  {game.title}
                </h2>

                {/* TAGS */}
                <div className="flex items-center gap-2 mb-6">
                  <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold capitalize">
                    {game.templateType.replaceAll("_", " ").toLowerCase()}
                  </span>
                  <span className="bg-slate-50 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
                    {game.educationLevel}
                  </span>
                </div>

                {/* FOOTER AREA */}
                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                  <p className="text-xs text-slate-400 font-bold">
                    Diff: <span className="text-slate-600">{game.difficulty}</span>
                  </p>
                  <p className="text-xs text-indigo-500 font-black bg-indigo-50 px-3 py-1.5 rounded-full">
                    ▶ {game.playCount || 0} plays
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}