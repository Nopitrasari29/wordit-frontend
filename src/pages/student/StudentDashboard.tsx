import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { getGames } from "../services/game.service"
import { templateIcons } from "../../data/templateIcons"
import ScoreChart from "../../components/analytics/ScoreChart"
import { useAuth } from "../../context/AuthContext"
import { getMyAnalytics } from "../services/analytics.service"

// ✅ FE-19: Helper untuk format detik menjadi string waktu yang mudah dibaca
const formatStudyTime = (totalSeconds: number): string => {
  if (!totalSeconds || totalSeconds <= 0) return "0 menit";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0)
    return `${hours} jam ${minutes > 0 ? `${minutes} mnt` : ""}`.trim();
  if (minutes > 0) return `${minutes} menit`;
  return `${totalSeconds} detik`;
};

const badgeStyles: Record<string, {
  bg: string;
  border: string;
  glow: string;
  iconBg: string;
  textColor: string;
}> = {
  "First Blood": {
    bg: "bg-rose-50/70 backdrop-blur-md",
    border: "border-rose-200/60",
    glow: "shadow-rose-100 hover:shadow-rose-300/60",
    iconBg: "bg-gradient-to-tr from-rose-400 to-pink-500",
    textColor: "text-rose-700"
  },
  "Rajin Belajar": {
    bg: "bg-blue-50/70 backdrop-blur-md",
    border: "border-blue-200/60",
    glow: "shadow-blue-100 hover:shadow-blue-300/60",
    iconBg: "bg-gradient-to-tr from-blue-400 to-indigo-500",
    textColor: "text-blue-700"
  },
  "Master Quiz": {
    bg: "bg-amber-50/70 backdrop-blur-md",
    border: "border-amber-200/60",
    glow: "shadow-amber-100 hover:shadow-amber-300/60",
    iconBg: "bg-gradient-to-tr from-amber-400 to-orange-500",
    textColor: "text-amber-700"
  },
  "Brainiac": {
    bg: "bg-indigo-50/70 backdrop-blur-md",
    border: "border-indigo-200/60",
    glow: "shadow-indigo-100 hover:shadow-indigo-300/60",
    iconBg: "bg-gradient-to-tr from-indigo-400 to-violet-500",
    textColor: "text-indigo-700"
  },
  "Perfectionist": {
    bg: "bg-cyan-50/70 backdrop-blur-md",
    border: "border-cyan-200/60",
    glow: "shadow-cyan-100 hover:shadow-cyan-300/60",
    iconBg: "bg-gradient-to-tr from-cyan-400 to-teal-500",
    textColor: "text-cyan-700"
  },
  "Fast & Furious": {
    bg: "bg-yellow-50/70 backdrop-blur-md",
    border: "border-yellow-200/60",
    glow: "shadow-yellow-100 hover:shadow-yellow-300/60",
    iconBg: "bg-gradient-to-tr from-yellow-400 to-amber-500",
    textColor: "text-yellow-700"
  },
  "Konsisten": {
    bg: "bg-emerald-50/70 backdrop-blur-md",
    border: "border-emerald-200/60",
    glow: "shadow-emerald-100 hover:shadow-emerald-300/60",
    iconBg: "bg-gradient-to-tr from-emerald-400 to-teal-500",
    textColor: "text-emerald-700"
  }
};

const fallbackStyle = {
  bg: "bg-slate-50/70 backdrop-blur-md",
  border: "border-slate-200/60",
  glow: "shadow-slate-100 hover:shadow-slate-300/60",
  iconBg: "bg-gradient-to-tr from-slate-400 to-slate-500",
  textColor: "text-slate-700"
};

export default function StudentDashboard() {
  const { user } = useAuth();

  const [games, setGames] = useState<any[]>([])
  const [playerName, setPlayerName] = useState("Champion")

  // ✅ NEW ANALYTICS STATE
  const [analytics, setAnalytics] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [badges, setBadges] = useState<any[]>([])
  const [loadingAnalytics, setLoadingAnalytics] = useState(true)

  // ✅ DEFAULT CHART
  const [performanceData, setPerformanceData] = useState<{ game: string; score: number }[]>([])

  // State untuk Sesi Aktif Re-entry
  const [activeRoom, setActiveRoom] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const room = sessionStorage.getItem("activeGameRoom")
    const id = sessionStorage.getItem("activeGameId")
    if (room && id) {
      setActiveRoom(room)
      setActiveId(id)
    }
  }, [])

  useEffect(() => {
    const realName = user?.name || sessionStorage.getItem("playerName")
    if (realName) setPlayerName(realName)

    async function load() {
      try {
        const data = await getGames()

        if (data && Array.isArray(data)) {
          setGames(data.slice(0, 3))
        } else {
          setGames([])
        }
      } catch (err) {
        console.error("Gagal memuat game:", err)
        setGames([])
      }
    }

    // ✅ LOAD ANALYTICS REAL
    async function loadAnalytics() {
      try {
        setLoadingAnalytics(true)

        const data = await getMyAnalytics()

        setAnalytics(data.overview)
        setHistory(data.recentHistory || [])
        setBadges(data.badges || [])

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

      {/* ================= RE-ENTRY ACTIVE SESSION BANNER ================= */}
      {activeRoom && activeId && (
        <div className="bg-amber-500 text-white rounded-[2rem] p-5 shadow-lg flex flex-col sm:flex-row justify-between items-center gap-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-pulse">⚡</span>
            <div>
              <h3 className="font-black text-sm md:text-base leading-none">Kamu memiliki sesi kuis yang sedang aktif!</h3>
              <p className="text-amber-100 text-xs mt-1">Sesi kelas untuk kuis dengan Room Code: <span className="font-bold uppercase">{activeRoom}</span> sedang menunggumu.</p>
            </div>
          </div>
          <Link
            to={`/play/${activeId}`}
            className="bg-white text-amber-600 px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-wider hover:bg-amber-50 transition-all shadow-md"
          >
            Masuk Kembali ⚡
          </Link>
        </div>
      )}

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

          <div className="flex-1 min-w-0">
            <p className="text-slate-400 font-black text-[10px] mb-1 uppercase tracking-widest">
              Total XP
            </p>

            <h2 className="text-3xl font-black text-slate-800 tracking-tighter">
              {loadingAnalytics ? (
                <div className="h-8 bg-slate-200 rounded w-16 animate-pulse mt-1"></div>
              ) : (
                analytics?.totalXp || 0
              )}
            </h2>
          </div>
        </div>

        {/* TOTAL QUIZ */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6 hover:-translate-y-1 transition-all group">
          <div className="w-16 h-16 shrink-0 bg-purple-50 text-purple-600 rounded-3xl flex items-center justify-center text-3xl group-hover:bg-purple-600 group-hover:text-white transition-all shadow-inner">
            🎮
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-slate-400 font-black text-[10px] mb-1 uppercase tracking-widest">
              Quiz Played
            </p>

            <h2 className="text-3xl font-black text-slate-800">
              {loadingAnalytics ? (
                <div className="h-8 bg-slate-200 rounded w-12 animate-pulse mt-1"></div>
              ) : (
                analytics?.totalGamesPlayed || 0
              )}
            </h2>
          </div>
        </div>

        {/* AVG ACCURACY */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6 hover:-translate-y-1 transition-all group">
          <div className="w-16 h-16 shrink-0 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center text-3xl group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-inner">
            🎯
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-slate-400 font-black text-[10px] mb-1 uppercase tracking-widest">
              Avg Accuracy
            </p>

            <h2 className="text-3xl font-black text-slate-800">
              {loadingAnalytics ? (
                <div className="h-8 bg-slate-200 rounded w-16 animate-pulse mt-1"></div>
              ) : (
                `${analytics?.averageAccuracy || 0}%`
              )}
            </h2>
          </div>
        </div>

        {/* STUDY TIME */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6 hover:-translate-y-1 transition-all group">
          <div className="w-16 h-16 shrink-0 bg-cyan-50 text-cyan-600 rounded-3xl flex items-center justify-center text-3xl group-hover:bg-cyan-600 group-hover:text-white transition-all shadow-inner">
            ⏱️
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-slate-400 font-black text-[10px] mb-1 uppercase tracking-widest">
              Study Time
            </p>

            <h2 className="text-2xl font-black text-slate-800">
              {loadingAnalytics ? (
                <div className="h-8 bg-slate-200 rounded w-24 animate-pulse mt-1"></div>
              ) : (
                formatStudyTime(analytics?.totalTimeSpentSeconds || 0)
              )}
            </h2>
          </div>
        </div>
      </div>

      {/* ================= BADGES ================= */}
      <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-slate-100">

        <h2 className="text-2xl font-black text-slate-800 mb-6">
          Achievement Badges 🏅
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {loadingAnalytics ? (
            Array(3).fill(null).map((_, i) => (
              <div
                key={i}
                className="h-[96px] bg-slate-50 border border-slate-100 rounded-[2rem] w-full animate-pulse"
              />
            ))
          ) : badges.filter((b: any) => b.isUnlocked).length > 0 ? (
            badges
              .filter((b: any) => b.isUnlocked)
              .map((badge: any, i: number) => {
                const style = badgeStyles[badge.name] || fallbackStyle;
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-4 p-5 rounded-[2rem] border transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 shadow-sm group ${style.bg} ${style.border} ${style.glow}`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-md ${style.iconBg} group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 text-white`}>
                      {badge.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-black text-base tracking-tight leading-snug ${style.textColor}`}>
                        {badge.name}
                      </h3>
                      <p className="text-slate-500 font-semibold text-xs leading-relaxed mt-0.5">
                        {badge.description}
                      </p>
                    </div>
                  </div>
                );
              })
          ) : (
            <p className="text-slate-400 font-bold text-sm italic col-span-full">
              Belum ada badge yang terbuka. Terus kumpulkan XP! 🎯
            </p>
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

          {performanceData.length > 0 ? (
            <div className="h-72">
              <ScoreChart data={performanceData} />
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl">
              <p className="text-slate-400 font-bold">
                Belum ada data permainan. Yuk, mainkan kuis sekarang!
              </p>
            </div>
          )}

        </div>
      </div>

      {/* ================= HISTORY ================= */}
      <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-slate-100">

        <h2 className="text-2xl font-black text-slate-800 mb-6">
          Riwayat Bermain 📚
        </h2>

        <div className="space-y-4">
          {loadingAnalytics ? (
            Array(3).fill(null).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-slate-50 rounded-2xl p-5 animate-pulse"
              >
                <div className="space-y-2 w-1/2">
                  <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                </div>
                <div className="space-y-2 text-right w-12">
                  <div className="h-6 bg-slate-200 rounded w-full ml-auto"></div>
                  <div className="h-3 bg-slate-200 rounded w-3/4 ml-auto"></div>
                </div>
              </div>
            ))
          ) : (
            <>
              {history.length === 0 && (
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
            </>
          )}
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
          {games.length === 0 ? (
            <div className="col-span-full bg-white p-12 rounded-[2.5rem] border border-slate-100 text-center shadow-sm">
              <span className="text-5xl mb-4 block">🎒</span>
              <h3 className="text-xl font-black text-slate-800">Belum Ada Game Tersedia</h3>
              <p className="text-slate-400 font-bold text-sm mt-2 mb-6">Eksplor halaman jelajah untuk mencari kuis buatan guru-guru lain.</p>
              <Link to="/explore" className="inline-block bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-3.5 rounded-full font-black text-sm transition-all active:scale-95 shadow-lg shadow-cyan-100">
                Jelajah Kuis ➔
              </Link>
            </div>
          ) : (
            games.map(game => (
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

                <div className="flex items-center gap-2 mb-4 px-2 flex-wrap">
                  <span className="bg-cyan-50 text-cyan-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                    {game.templateType?.replace('_', ' ')}
                  </span>
                  <span className="text-slate-300 font-black">•</span>
                  <span className="text-slate-400 font-bold text-[10px] uppercase">
                    {game.educationLevel}
                  </span>
                  {game.classGrade && (
                    <>
                      <span className="text-slate-300 font-black">•</span>
                      <span className="bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full text-[9px] font-black uppercase">
                        Kelas {game.classGrade}
                      </span>
                    </>
                  )}
                </div>

                <p className="text-slate-400 text-sm font-bold px-2 mb-6 line-clamp-2">
                  {game.description}
                </p>

                <Link
                  to={`/play/${game.id}`}
                  className="mt-auto bg-cyan-500 hover:bg-cyan-600 text-white py-4 rounded-[1.5rem] font-black text-center transition-all shadow-lg shadow-cyan-100"
                >
                  Mainkan 🚀
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}