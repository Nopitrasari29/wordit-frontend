import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { getGames } from "../services/game.service"
import { dummyGames } from "../../data/dummyGames"
import { templateIcons } from "../../data/templateIcons" // 🎯 Gunakan ikon dinamis
import ScoreChart from "../../components/analytics/ScoreChart"
import { useAuth } from "../../context/AuthContext"

export default function StudentDashboard() {
  const { user } = useAuth()
  const [games, setGames] = useState<any[]>([])
  const [playerName, setPlayerName] = useState("Champion")

  // Data dummy untuk performa grafik
  const performanceData = [
    { game: "Anagram", score: 85 },
    { game: "Hangman", score: 70 },
    { game: "Word Search", score: 95 },
    { game: "Maze Chase", score: 60 },
  ]

  useEffect(() => {
    // 🎯 Prioritaskan nama dari AuthContext (real user), fallback ke sessionStorage
    const realName = user?.name || sessionStorage.getItem("playerName")
    if (realName) setPlayerName(realName)

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
  }, [user?.name])

  return (
    <div className="space-y-10 font-sans pb-12 pt-6">

      {/* ================= HEADER BANNER ================= */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-[2.5rem] p-8 md:p-12 text-white shadow-xl shadow-cyan-200 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-white opacity-20 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-5xl font-black mb-3 italic tracking-tighter">
              Selamat Datang, {playerName}! 🌟
            </h1>
            <p className="text-cyan-50 font-semibold text-lg leading-relaxed">
              Pantau progres belajarmu hari ini. Tingkatkan terus performamu di WordIT!
            </p>
          </div>
          <Link
            to="/student/join"
            className="bg-white text-cyan-600 px-10 py-5 rounded-[2rem] font-black text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all whitespace-nowrap flex items-center gap-3"
          >
            🎮 Masukkan Kode
          </Link>
        </div>
      </div>

      {/* ================= MY STATS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sans">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6 hover:-translate-y-1 transition-all group">
          <div className="w-16 h-16 shrink-0 bg-cyan-50 text-cyan-600 rounded-3xl flex items-center justify-center text-3xl group-hover:bg-cyan-600 group-hover:text-white transition-all shadow-inner">🎯</div>
          <div>
            <p className="text-slate-400 font-black text-[10px] mb-1 uppercase tracking-widest">Avg Score</p>
            <h2 className="text-3xl font-black text-slate-800">82%</h2>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6 hover:-translate-y-1 transition-all group">
          <div className="w-16 h-16 shrink-0 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center text-3xl group-hover:bg-amber-600 group-hover:text-white transition-all shadow-inner">⚡</div>
          <div>
            <p className="text-slate-400 font-black text-[10px] mb-1 uppercase tracking-widest">Total XP</p>
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter">1,450</h2>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6 hover:-translate-y-1 transition-all group">
          <div className="w-16 h-16 shrink-0 bg-purple-50 text-purple-600 rounded-3xl flex items-center justify-center text-3xl group-hover:bg-purple-600 group-hover:text-white transition-all shadow-inner">🔥</div>
          <div>
            <p className="text-slate-400 font-black text-[10px] mb-1 uppercase tracking-widest">Day Streak</p>
            <h2 className="text-3xl font-black text-slate-800">7</h2>
          </div>
        </div>
      </div>

      {/* ================= STUDENT ANALYTICS ================= */}
      <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-slate-100">
        <div className="mb-8 px-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-800 italic underline decoration-cyan-200 underline-offset-8">
              Analitik Performa Saya 📈
            </h2>
            <p className="text-slate-400 font-bold text-xs mt-3 uppercase tracking-widest">Grafik hasil pengerjaan game terakhir</p>
          </div>
          <Link to="/student/analytics" className="bg-slate-50 text-slate-600 px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-cyan-600 hover:text-white transition-all border border-slate-100">LIHAT DETAIL ➔</Link>
        </div>

        <div className="bg-slate-50/50 rounded-[2.5rem] p-6 md:p-10 border border-slate-100">
          <div className="h-72">
            <ScoreChart data={performanceData} />
          </div>
        </div>
      </div>

      {/* ================= RECENT GAMES PLAYED ================= */}
      <div>
        <div className="flex justify-between items-center mb-8 px-4">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            Terakhir Dimainkan 🎮
          </h2>
          <Link to="/explore" className="text-cyan-600 font-black hover:underline tracking-tight text-sm italic">Eksplor Lagi ➔</Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 px-2">
          {games.map(game => (
            <div
              key={game.id}
              className="bg-white p-8 rounded-[3rem] shadow-sm hover:shadow-2xl border border-slate-100 transition-all duration-300 hover:-translate-y-2 flex flex-col relative overflow-hidden group"
            >
              <div className="bg-slate-50 rounded-[2.5rem] h-44 mb-6 flex items-center justify-center text-6xl transition-transform group-hover:scale-110 shadow-inner">
                {/* 🎯 Gunakan ikon yang sesuai template kuis */}
                {templateIcons[game.templateType] || "🧩"}
              </div>

              <h3 className="text-xl font-black text-slate-800 mb-2 truncate px-2 italic">
                {game.title}
              </h3>

              <div className="flex items-center gap-2 mb-8 px-2">
                <span className="bg-cyan-50 text-cyan-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                  {game.templateType?.replace(/_/g, " ")}
                </span>
                <span className="text-slate-300 font-black">•</span>
                <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                  {game.educationLevel}
                </span>
              </div>

              <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between font-sans px-2">
                <div>
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Skor Terakhir</p>
                  <p className="text-xl font-black text-cyan-600 tracking-tighter">95/100</p>
                </div>
                <Link
                  // 🎯 FIX: Gunakan rute universal agar bisa langsung main
                  to={`/play/${game.id}`}
                  className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-xs font-black hover:bg-cyan-600 transition-colors shadow-lg shadow-slate-100 uppercase italic"
                >
                  REPLAY
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= LEADERBOARD GLOBAL ================= */}
      <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-slate-100">
        <div className="mb-10 px-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl font-black text-slate-800 italic underline decoration-cyan-200 underline-offset-8">
            Leaderboard Global 🏆
          </h2>
          <Link to="/student/leaderboard" className="text-cyan-600 font-black text-sm hover:underline italic">
            LIHAT PERINGKAT GAME ➔
          </Link>
        </div>

        <div className="bg-slate-50/50 rounded-[2.5rem] p-4 border border-slate-100 overflow-hidden">
          <div className="flex px-8 pb-4 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <div className="w-16 text-center">Rank</div>
            <div className="flex-1">Player</div>
            <div className="w-32 text-right">Experience</div>
          </div>

          {[
            { rank: 1, name: "Andi", xp: "120 XP", color: "bg-amber-100 text-amber-600" },
            { rank: 2, name: "Budi", xp: "100 XP", color: "bg-slate-200 text-slate-600" },
            { rank: 3, name: "Siti", xp: "90 XP", color: "bg-orange-100 text-orange-700" }
          ].map((item) => (
            <div key={item.rank} className="flex items-center px-8 py-5 hover:bg-white hover:shadow-xl rounded-[1.5rem] transition-all mt-2 group cursor-default border border-transparent hover:border-slate-100">
              <div className="w-16">
                <span className={`w-10 h-10 ${item.color} rounded-full flex items-center justify-center font-black shadow-sm group-hover:scale-110 transition-transform text-sm`}>
                  {item.rank}
                </span>
              </div>
              <div className="flex-1 font-black text-slate-800 text-lg group-hover:text-cyan-600 transition-colors italic tracking-tight">
                {/* 🎯 Logika: Highlight jika nama sama dengan user */}
                {item.name === playerName ? "Kamu" : item.name}
              </div>
              <div className="w-32 text-right">
                <span className="bg-cyan-100 text-cyan-700 px-5 py-2 rounded-full text-xs font-black group-hover:bg-cyan-600 group-hover:text-white transition-all shadow-sm">
                  {item.xp}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}