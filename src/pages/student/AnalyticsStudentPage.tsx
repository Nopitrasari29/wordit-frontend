import { useAuth } from "../../context/AuthContext"
import ScoreChart from "../../components/analytics/ScoreChart"

export default function AnalyticsStudentPage() {
    const { user } = useAuth()

    // Data dummy untuk grafik skor mahasiswa sesuai target FR-19
    // Menampilkan performa rata-rata per template game
    const performanceData = [
        { game: "Anagram", score: 85 },
        { game: "Hangman", score: 70 },
        { game: "Word Search", score: 95 },
        { game: "Maze Chase", score: 60 },
        { game: "Flashcard", score: 80 },
    ]

    return (
        <div className="space-y-10 font-sans pb-12 pt-6">

            {/* ================= HEADER BANNER (Gaya Bubbly) ================= */}
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

            {/* ================= STATS CARDS (Identik dengan Teacher Dashboard) ================= */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50 flex items-center gap-5 hover:-translate-y-1 transition-all duration-300 group">
                    <div className="w-16 h-16 shrink-0 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">🎮</div>
                    <div>
                        <p className="text-slate-500 font-bold text-sm mb-1 uppercase tracking-widest text-[10px]">Games Completed</p>
                        <h2 className="text-3xl font-black text-slate-800">42</h2>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50 flex items-center gap-5 hover:-translate-y-1 transition-all duration-300 group">
                    <div className="w-16 h-16 shrink-0 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl group-hover:bg-blue-600 group-hover:text-white transition-colors">🎯</div>
                    <div>
                        <p className="text-slate-500 font-bold text-sm mb-1 uppercase tracking-widest text-[10px]">Overall Accuracy</p>
                        <h2 className="text-3xl font-black text-slate-800">88%</h2>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50 flex items-center gap-5 hover:-translate-y-1 transition-all duration-300 group">
                    <div className="w-16 h-16 shrink-0 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center text-3xl group-hover:bg-green-600 group-hover:text-white transition-colors">🌟</div>
                    <div>
                        <p className="text-slate-500 font-bold text-sm mb-1 uppercase tracking-widest text-[10px]">XP Earned</p>
                        <h2 className="text-3xl font-black text-slate-800">2,450</h2>
                    </div>
                </div>
            </div>

            {/* ================= DETAILED SCORE CHART (Gaya Class Analytics) ================= */}
            <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-50">
                <div className="mb-8 px-2">
                    <h2 className="text-2xl font-black text-slate-800 italic underline decoration-indigo-200 underline-offset-8">
                        Statistik Performa Saya
                    </h2>
                </div>

                {/* Kontainer Grafik yang Identik dengan Class Analytics */}
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

                    {/* Menggunakan ScoreChart yang kodenya identik dengan AnalyticsClassPage */}
                    <div className="h-72">
                        <ScoreChart data={performanceData} />
                    </div>
                </div>
            </div>

            {/* ================= BADGES COLLECTION (FR-19) ================= */}
            <div>
                <h2 className="text-2xl font-black text-slate-800 mb-8 px-4">
                    Koleksi Badges 🎖️
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 px-2">
                    {[
                        { name: "Speedster", icon: "⚡", color: "bg-amber-50 text-amber-600" },
                        { name: "Problem Solver", icon: "🧠", color: "bg-blue-50 text-blue-600" },
                        { name: "Word Master", icon: "🧙", color: "bg-purple-50 text-purple-600" },
                        { name: "7-Day Streak", icon: "🔥", color: "bg-rose-50 text-rose-600" }
                    ].map((badge, i) => (
                        <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center text-center hover:scale-105 transition-all duration-300 group">
                            <div className={`w-20 h-20 ${badge.color} rounded-full flex items-center justify-center text-4xl mb-4 shadow-inner group-hover:rotate-12 transition-transform`}>
                                {badge.icon}
                            </div>
                            <span className="font-black text-slate-700 text-sm tracking-tight">{badge.name}</span>
                            <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Unlocked</span>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    )
}