import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import ScoreChart from "../../components/analytics/ScoreChart"
import { toast } from "react-hot-toast"
import { Loader2 } from "lucide-react"

// Asumsikan kamu punya service ini, sesuaikan import-nya jika berbeda
// import { getStudentAnalytics } from "../../pages/services/score.service"
import api from "../../pages/services/api"

export default function AnalyticsStudentPage() {
    const { user } = useAuth()

    // 🧠 State Dinamis untuk Real Data
    const [isLoading, setIsLoading] = useState(true)
    const [stats, setStats] = useState({
        gamesCompleted: 0,
        overallAccuracy: 0,
        totalXp: 0
    })
    const [performanceData, setPerformanceData] = useState<{ game: string, score: number }[]>([])
    const [badges, setBadges] = useState<{ name: string, icon: string, color: string, isUnlocked: boolean }[]>([])

    // 🚀 Fetch Real Data dari Backend
    useEffect(() => {
        const fetchAnalytics = async () => {
            setIsLoading(true)
            try {
                // TODO: Ganti dengan pemanggilan service yang tepat jika sudah dibuat
                const response = await api.get('/scores/analytics/student');
                const data = response.data;

                // Set Data Statistik
                setStats({
                    gamesCompleted: data.gamesCompleted || 0,
                    overallAccuracy: data.overallAccuracy || 0,
                    totalXp: data.totalXp || 0
                });

                // Set Data Grafik
                if (data.performanceData && data.performanceData.length > 0) {
                    setPerformanceData(data.performanceData);
                }

                // Set Badges (Filter yang unlocked saja jika dari API bawaan)
                if (data.badges) {
                    setBadges(data.badges);
                }

            } catch (error) {
                console.error("Gagal menarik data analytics:", error)
                toast.error("Gagal memuat data analitik terbaru.")

                // --- FALLBACK JIKA API BELUM SIAP (Anti-Crash) ---
                setPerformanceData([
                    { game: "Multiple Choice", score: 85 },
                    { game: "True/False", score: 90 },
                    { game: "Matching", score: 75 },
                    { game: "Word Search", score: 95 },
                    { game: "Smart Essay", score: 80 },
                ])
                setBadges([
                    { name: "First Blood", icon: "🩸", color: "bg-rose-50 text-rose-600", isUnlocked: true },
                    { name: "Brainiac", icon: "🧠", color: "bg-blue-50 text-blue-600", isUnlocked: true },
                    { name: "Fast & Furious", icon: "⚡", color: "bg-amber-50 text-amber-600", isUnlocked: false }
                ])
            } finally {
                setIsLoading(false)
            }
        }

        fetchAnalytics()
    }, [])

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 size={48} className="text-indigo-500 animate-spin" />
                <p className="font-black text-slate-400 uppercase tracking-widest text-sm">Menarik Data Performa...</p>
            </div>
        )
    }

    return (
        <div className="space-y-10 font-sans pb-12 pt-6 animate-fade-in">

            {/* ================= HEADER BANNER ================= */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-[2.5rem] p-8 md:p-12 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl md:text-5xl font-black mb-3 text-white">
                        Learning Progress 🚀
                    </h1>
                    <p className="text-indigo-100 font-semibold text-lg leading-relaxed max-w-2xl">
                        Halo, {user?.name || 'Player'}! Di sini kamu bisa melihat pencapaianmu, menganalisis skor, dan melihat koleksi badges yang sudah kamu kumpulkan.
                    </p>
                </div>
            </div>

            {/* ================= STATS CARDS ================= */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50 flex items-center gap-5 hover:-translate-y-1 transition-all duration-300 group">
                    <div className="w-16 h-16 shrink-0 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">🎮</div>
                    <div>
                        <p className="text-slate-500 font-bold text-sm mb-1 uppercase tracking-widest text-[10px]">Games Completed</p>
                        <h2 className="text-3xl font-black text-slate-800">{stats.gamesCompleted}</h2>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50 flex items-center gap-5 hover:-translate-y-1 transition-all duration-300 group">
                    <div className="w-16 h-16 shrink-0 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl group-hover:bg-blue-600 group-hover:text-white transition-colors">🎯</div>
                    <div>
                        <p className="text-slate-500 font-bold text-sm mb-1 uppercase tracking-widest text-[10px]">Overall Accuracy</p>
                        <h2 className="text-3xl font-black text-slate-800">{stats.overallAccuracy}%</h2>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50 flex items-center gap-5 hover:-translate-y-1 transition-all duration-300 group">
                    <div className="w-16 h-16 shrink-0 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center text-3xl group-hover:bg-green-600 group-hover:text-white transition-colors">🌟</div>
                    <div>
                        <p className="text-slate-500 font-bold text-sm mb-1 uppercase tracking-widest text-[10px]">XP Earned</p>
                        <h2 className="text-3xl font-black text-slate-800">{stats.totalXp.toLocaleString()}</h2>
                    </div>
                </div>
            </div>

            {/* ================= DETAILED SCORE CHART ================= */}
            <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-50">
                <div className="mb-8 px-2">
                    <h2 className="text-2xl font-black text-slate-800 italic underline decoration-indigo-200 underline-offset-8">
                        Statistik Performa Saya
                    </h2>
                </div>

                <div className="bg-slate-50/50 rounded-[2rem] p-4 md:p-8 border border-slate-100">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 bg-white text-indigo-600 rounded-2xl flex items-center justify-center text-3xl shadow-sm">
                            📈
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">Score Analytics</h3>
                            <p className="text-sm font-bold text-slate-500">Rata-rata nilai berdasarkan tipe permainan</p>
                        </div>
                    </div>

                    {performanceData.length > 0 ? (
                        <div className="h-72">
                            <ScoreChart data={performanceData} />
                        </div>
                    ) : (
                        <div className="h-72 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl">
                            <p className="text-slate-400 font-bold">Belum ada data permainan. Yuk, mainkan kuis sekarang!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ================= BADGES COLLECTION ================= */}
            <div>
                <h2 className="text-2xl font-black text-slate-800 mb-8 px-4">
                    Koleksi Badges 🎖️
                </h2>

                {badges.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 px-2">
                        {badges.map((badge, i) => (
                            <div key={i} className={`bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center text-center transition-all duration-300 group ${badge.isUnlocked ? 'hover:scale-105' : 'opacity-60 grayscale'}`}>
                                <div className={`w-20 h-20 ${badge.color} rounded-full flex items-center justify-center text-4xl mb-4 shadow-inner ${badge.isUnlocked ? 'group-hover:rotate-12 transition-transform' : ''}`}>
                                    {badge.icon}
                                </div>
                                <span className="font-black text-slate-700 text-sm tracking-tight">{badge.name}</span>
                                <span className={`text-[10px] font-bold mt-1 uppercase tracking-widest ${badge.isUnlocked ? 'text-emerald-500' : 'text-slate-400'}`}>
                                    {badge.isUnlocked ? 'Unlocked' : 'Locked'}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-slate-50 py-12 rounded-[2rem] border-2 border-dashed border-slate-200 text-center">
                        <span className="text-4xl grayscale opacity-50 mb-3 block">🏅</span>
                        <p className="text-slate-400 font-bold">Kamu belum mengumpulkan badge. Kumpulkan XP untuk membukanya!</p>
                    </div>
                )}
            </div>

        </div>
    )
}