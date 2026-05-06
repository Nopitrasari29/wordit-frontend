import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { getGames } from "../services/game.service"
import { dummyGames } from "../../data/dummyGames"
import { templateIcons } from "../../data/templateIcons"
import ScoreChart from "../../components/analytics/ScoreChart"
import { useAuth } from "../../context/AuthContext"
import { getMyAnalytics } from "../services/analytics.service"

export default function StudentDashboard() {
  const { user } = useAuth()

  const [games, setGames] = useState<any[]>([])
  const [playerName, setPlayerName] = useState("Champion")

  // ✅ NEW ANALYTICS STATE
  const [analytics, setAnalytics] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [loadingAnalytics, setLoadingAnalytics] = useState(true)

  // ✅ DEFAULT CHART
  const [performanceData, setPerformanceData] = useState([
    { game: "Anagram", score: 85 },
    { game: "Hangman", score: 70 },
    { game: "Word Search", score: 95 },
    { game: "Maze Chase", score: 60 },
  ])

  useEffect(() => {
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

    // ✅ LOAD ANALYTICS REAL
    async function loadAnalytics() {
      try {
        setLoadingAnalytics(true)

        const data = await getMyAnalytics()

        setAnalytics(data.overview)
        setHistory(data.recentHistory || [])

        // ✅ REAL CHART
        if (data.recentHistory?.length > 0) {
          const chartData = data.recentHistory
            .slice(0, 5)
            .reverse()
            .map((item: any) => ({
              game: item.gameTitle,
              score: item.score,
            }))

          setPerformanceData(chartData)
        }

      } catch (error) {
        console.error("❌ Failed load analytics:", error)
      } finally {
        setLoadingAnalytics(false)
      }
    }

    load()
    loadAnalytics()

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sans">

        {/* TOTAL XP */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6 hover:-translate-y-1 transition-all group">
          <div className="w-16 h-16 shrink-0 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center text-3xl group-hover:bg-amber-600 group-hover:text-white transition-all shadow-inner">
            ⚡
          </div>

          <div>
            <p className="text-slate-400 font-black text-[10px] mb-1 uppercase tracking-widest">
              Total XP
            </p>

            <h2 className="text-3xl font-black text-slate-800 tracking-tighter">
              {analytics?.totalXp || 0}
            </h2>
          </div>
        </div>

        {/* TOTAL QUIZ */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6 hover:-translate-y-1 transition-all group">
          <div className="w-16 h-16 shrink-0 bg-purple-50 text-purple-600 rounded-3xl flex items-center justify-center text-3xl group-hover:bg-purple-600 group-hover:text-white transition-all shadow-inner">
            🎮
          </div>

          <div>
            <p className="text-slate-400 font-black text-[10px] mb-1 uppercase tracking-widest">
              Quiz Played
            </p>

            <h2 className="text-3xl font-black text-slate-800">
              {analytics?.totalGamesPlayed || 0}
            </h2>
          </div>
        </div>

        {/* AVG ACCURACY */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6 hover:-translate-y-1 transition-all group">
          <div className="w-16 h-16 shrink-0 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center text-3xl group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-inner">
            🎯
          </div>

          <div>
            <p className="text-slate-400 font-black text-[10px] mb-1 uppercase tracking-widest">
              Avg Accuracy
            </p>

            <h2 className="text-3xl font-black text-slate-800">
              {analytics?.averageAccuracy || 0}%
            </h2>
          </div>
        </div>

        {/* STUDY TIME */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6 hover:-translate-y-1 transition-all group">
          <div className="w-16 h-16 shrink-0 bg-cyan-50 text-cyan-600 rounded-3xl flex items-center justify-center text-3xl group-hover:bg-cyan-600 group-hover:text-white transition-all shadow-inner">
            ⏱️
          </div>

          <div>
            <p className="text-slate-400 font-black text-[10px] mb-1 uppercase tracking-widest">
              Study Time
            </p>

            <h2 className="text-3xl font-black text-slate-800">
              {Math.floor((analytics?.totalTimeSpentSeconds || 0) / 60)}m
            </h2>
          </div>
        </div>
      </div>

      {/* ================= BADGES ================= */}
      <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-slate-100">

        <h2 className="text-2xl font-black text-slate-800 mb-6">
          Achievement Badges 🏅
        </h2>

        <div className="flex flex-wrap gap-4">

          {(analytics?.averageAccuracy || 0) >= 90 && (
            <div className="bg-amber-100 text-amber-700 px-5 py-3 rounded-2xl font-black">
              🥇 Master Accuracy
            </div>
          )}

          {(analytics?.totalGamesPlayed || 0) >= 5 && (
            <div className="bg-cyan-100 text-cyan-700 px-5 py-3 rounded-2xl font-black">
              🔥 Active Learner
            </div>
          )}

          {(analytics?.totalXp || 0) >= 1000 && (
            <div className="bg-indigo-100 text-indigo-700 px-5 py-3 rounded-2xl font-black">
              ⚡ XP Hunter
            </div>
          )}

        </div>
      </div>

      {/* ================= STUDENT ANALYTICS ================= */}
      <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-slate-100">

        <div className="mb-8 px-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

          <div>
            <h2 className="text-2xl font-black text-slate-800 italic underline decoration-cyan-200 underline-offset-8">
              Analitik Performa Saya 📈
            </h2>

            <p className="text-slate-400 font-bold text-xs mt-3 uppercase tracking-widest">
              Grafik hasil pengerjaan game terakhir
            </p>
          </div>

          <Link
            to="/student/analytics"
            className="bg-slate-50 text-slate-600 px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-cyan-600 hover:text-white transition-all border border-slate-100"
          >
            LIHAT DETAIL ➔
          </Link>
        </div>

        <div className="bg-slate-50/50 rounded-[2.5rem] p-6 md:p-10 border border-slate-100">

          <div className="h-72">
            <ScoreChart data={performanceData} />
          </div>

        </div>
      </div>

      {/* ================= HISTORY ================= */}
      <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-slate-100">

        <h2 className="text-2xl font-black text-slate-800 mb-6">
          Riwayat Bermain 📚
        </h2>

        <div className="space-y-4">

          {history.length === 0 && !loadingAnalytics && (
            <div className="text-slate-400 font-bold text-center py-10">
              Belum ada riwayat permainan
            </div>
          )}

          {history.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between bg-slate-50 rounded-2xl p-5"
            >
              <div>
                <h3 className="font-black text-slate-700">
                  {item.gameTitle}
                </h3>

                <p className="text-xs text-slate-400 font-bold uppercase">
                  {item.templateType}
                </p>
              </div>

              <div className="text-right">
                <p className="font-black text-cyan-600 text-xl">
                  {item.score}
                </p>

                <p className="text-xs text-slate-400 font-bold">
                  {item.accuracy}%
                </p>
              </div>
            </div>
          ))}

        </div>
      </div>

      {/* ================= RECENT GAMES PLAYED ================= */}
      <div>

        <div className="flex justify-between items-center mb-8 px-4">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            Terakhir Dimainkan 🎮
          </h2>

          <Link
            to="/explore"
            className="text-cyan-600 font-black hover:underline tracking-tight text-sm italic"
          >
            Eksplor Lagi ➔
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 px-2">

          {games.map(game => (
            <div
              key={game.id}
              className="bg-white p-8 rounded-[3rem] shadow-sm hover:shadow-2xl border border-slate-100 transition-all duration-300 hover:-translate-y-2 flex flex-col relative overflow-hidden group"
            >
              <div className="bg-slate-50 rounded-[2.5rem] h-44 mb-6 flex items-center justify-center text-6xl transition-transform group-hover:scale-110 shadow-inner">
                {templateIcons[game.templateType] || "🧩"}
              </div>

              <h3 className="text-xl font-black text-slate-800 mb-2 truncate px-2 italic">
                {game.title}
              </h3>

              <p className="text-slate-400 text-sm font-bold px-2 mb-6 line-clamp-2">
                {game.description}
              </p>

              <Link
                to={`/student/game/${game.id}`}
                className="mt-auto bg-cyan-500 hover:bg-cyan-600 text-white py-4 rounded-[1.5rem] font-black text-center transition-all shadow-lg shadow-cyan-100"
              >
                Mainkan 🚀
              </Link>
            </div>
          ))}

        </div>
      </div>
    </div>
  )
}