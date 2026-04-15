import { useEffect, useState } from "react"
import { getGames } from "../services/game.service"
import { dummyGames } from "../../data/dummyGames"

export default function StudentDashboard() {
  const [games, setGames] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      try {
        const data = await getGames()
        if (data && data.length > 0) {
          setGames(data.slice(0, 3))
        } else {
          setGames(dummyGames.slice(0, 3))
        }
      } catch {
        setGames(dummyGames.slice(0, 3))
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-10 font-sans pb-12">

      {/* HEADER BANNER - Ceria ala FloraVerse */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-[2.5rem] p-8 md:p-12 text-white shadow-xl shadow-cyan-200 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white opacity-20 rounded-full blur-3xl"></div>
        <h1 className="text-3xl md:text-5xl font-black mb-2 relative z-10">
          Student Dashboard 🌟
        </h1>
        <p className="text-cyan-50 font-semibold text-lg relative z-10">
          Ayo selesaikan kuis hari ini dan raih skor tertinggi!
        </p>
      </div>

      {/* RECOMMENDED GAMES */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 mb-6 px-2">
          Recommended Games
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {games.map(game => (
            <div
              key={game.id}
              className="bg-white p-6 rounded-[2rem] shadow-sm hover:shadow-xl border border-slate-50 transition-all duration-300 hover:-translate-y-2 cursor-pointer flex flex-col"
            >
              <div className="bg-slate-100 rounded-[1.5rem] h-24 mb-5 flex items-center justify-center text-4xl">
                🎮
              </div>

              <h3 className="font-black text-lg text-slate-800 mb-2 truncate">
                {game.title}
              </h3>

              <div className="flex gap-2">
                <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold capitalize">
                  {game.templateType.replaceAll("_", " ").toLowerCase()}
                </span>
                <span className="bg-slate-50 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
                  {game.educationLevel}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* LEADERBOARD (Dirombak dari <table> menjadi list card modern) */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 mb-6 px-2">
          Leaderboard Global 🏆
        </h2>

        <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-slate-50">

          {/* Header Row */}
          <div className="flex px-4 pb-2 border-b border-slate-100 text-sm font-bold text-slate-400">
            <div className="w-16 text-center">Rank</div>
            <div className="flex-1">Pemain</div>
            <div className="w-24 text-right">Skor</div>
          </div>

          {/* List Item 1 */}
          <div className="flex items-center px-4 py-4 hover:bg-slate-50 rounded-2xl transition-colors mt-2">
            <div className="w-16 flex justify-center">
              <span className="w-8 h-8 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center font-black">1</span>
            </div>
            <div className="flex-1 font-black text-slate-800 text-lg">Andi</div>
            <div className="w-24 text-right">
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-black">120 XP</span>
            </div>
          </div>

          {/* List Item 2 */}
          <div className="flex items-center px-4 py-4 hover:bg-slate-50 rounded-2xl transition-colors">
            <div className="w-16 flex justify-center">
              <span className="w-8 h-8 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center font-black">2</span>
            </div>
            <div className="flex-1 font-black text-slate-800 text-lg">Budi</div>
            <div className="w-24 text-right">
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-black">100 XP</span>
            </div>
          </div>

          {/* List Item 3 */}
          <div className="flex items-center px-4 py-4 hover:bg-slate-50 rounded-2xl transition-colors">
            <div className="w-16 flex justify-center">
              <span className="w-8 h-8 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center font-black">3</span>
            </div>
            <div className="flex-1 font-black text-slate-800 text-lg">Siti</div>
            <div className="w-24 text-right">
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-black">90 XP</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}