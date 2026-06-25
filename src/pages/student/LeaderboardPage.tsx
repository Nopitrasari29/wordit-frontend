import { useEffect, useState } from "react"
import { getGames } from "../services/game.service"
import { getStudentLeaderboard } from "../services/user.service"
import { getImageUrl } from "../../utils/assets"

export default function LeaderboardPage() {
    const [games, setGames] = useState<any[]>([]) 
    const [students, setStudents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<"games" | "students">("games")
    const [schoolFilter, setSchoolFilter] = useState("")
    const [debouncedSchool, setDebouncedSchool] = useState("")

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSchool(schoolFilter)
        }, 500)
        return () => clearTimeout(handler)
    }, [schoolFilter])

    // Load games sekali saat mount
    useEffect(() => {
        async function loadGamesData() {
            try {
                setLoading(true)
                const gamesData = await getGames()
                const gameList = Array.isArray(gamesData) ? gamesData : []
                const sortedGames = [...gameList].sort((a, b) =>
                    (b.playCount || 0) - (a.playCount || 0)
                )
                setGames(sortedGames)
            } catch (error) {
                console.error("Gagal memuat games:", error)
            } finally {
                setLoading(false)
            }
        }
        loadGamesData()
    }, [])

    // Load leaderboard siswa hanya saat tab students aktif atau filter berubah
    useEffect(() => {
        if (activeTab !== "students") return
        async function loadStudentsData() {
            try {
                setLoading(true)
                const studentsData = await getStudentLeaderboard(debouncedSchool || undefined).catch(err => {
                    console.error("Gagal memuat leaderboard siswa:", err)
                    return []
                })
                const studentList = Array.isArray(studentsData) ? studentsData : []
                setStudents(studentList)
            } catch (error) {
                console.error("Gagal memuat leaderboard siswa:", error)
            } finally {
                setLoading(false)
            }
        }
        loadStudentsData()
    }, [activeTab, debouncedSchool])

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20 pt-28">
            {/* HEADER BANNER */}
            <div className="max-w-4xl mx-auto px-6 mb-8">
                <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-[2.5rem] p-8 md:p-12 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="max-w-xl">
                            <h1 className="text-3xl md:text-5xl font-black mb-3 italic tracking-tighter">
                                {activeTab === "games" ? "Game Terpopuler 🏆" : "Student Hall of Fame 👑"}
                            </h1>
                            <p className="text-indigo-100 font-semibold text-sm md:text-base leading-relaxed">
                                {activeTab === "games" 
                                    ? "Lihat daftar kuis edukasi yang paling sering dimainkan dan dicari oleh para siswa di WordIT!"
                                    : "Papan peringkat 10 besar siswa teraktif yang mengumpulkan XP terbanyak dari kuis di WordIT!"}
                            </p>
                        </div>
                        <div className="text-5xl md:text-7xl animate-bounce shrink-0 select-none">
                            👑
                        </div>
                    </div>
                </div>
            </div>

            {/* TAB SWITCHER */}
            <div className="max-w-4xl mx-auto px-6 mb-8 flex flex-col items-center gap-4">
                <div className="bg-slate-200/60 p-1.5 rounded-full flex gap-1 border border-slate-300/30">
                    <button
                        onClick={() => setActiveTab("games")}
                        className={`px-8 py-3 rounded-full font-black text-xs uppercase tracking-wider transition-all ${
                            activeTab === "games"
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                                : "text-slate-600 hover:text-indigo-600"
                        }`}
                    >
                        🎮 Kuis Terpopuler
                    </button>
                    <button
                        onClick={() => setActiveTab("students")}
                        className={`px-8 py-3 rounded-full font-black text-xs uppercase tracking-wider transition-all ${
                            activeTab === "students"
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                                : "text-slate-600 hover:text-indigo-600"
                        }`}
                    >
                        👑 Siswa Teraktif
                    </button>
                </div>

                {/* SCHOOL FILTER */}
                {activeTab === "students" && (
                    <div className="relative w-full max-w-sm">
                        <input
                            type="text"
                            placeholder="Cari berdasarkan asal sekolah (Sekolah A, B...)..."
                            value={schoolFilter}
                            onChange={(e) => setSchoolFilter(e.target.value)}
                            className="w-full bg-white border-2 border-slate-100 focus:border-indigo-500 focus:bg-white pl-10 pr-4 py-3.5 rounded-full text-xs font-bold outline-none transition-all text-slate-700 shadow-sm placeholder:text-slate-400"
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 select-none pointer-events-none">
                            🏫
                        </div>
                        {schoolFilter && (
                            <button
                                onClick={() => setSchoolFilter("")}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* LIST SECTION */}
            <div className="max-w-4xl mx-auto px-6">
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 overflow-hidden">
                    {/* Custom Table Header */}
                    <div className="flex px-4 pb-6 border-b-2 border-slate-50 text-xs font-black text-slate-400 uppercase tracking-widest">
                        <div className="w-16 text-center">No</div>
                        <div className="flex-1 px-4">{activeTab === "games" ? "Nama Game" : "Nama Siswa"}</div>
                        <div className="w-36 text-right">{activeTab === "games" ? "Total Plays" : "Skor XP"}</div>
                    </div>

                    {/* List Content */}
                    <div className="pt-4 space-y-2">
                        {loading ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : activeTab === "games" ? (
                            games.length === 0 ? (
                                <p className="text-center py-10 text-slate-400 font-bold">Belum ada data game.</p>
                            ) : (
                                games.map((g: any, index: number) => (
                                    <div
                                        key={g.id}
                                        className="flex items-center px-4 py-4 hover:bg-slate-50 rounded-[1.5rem] transition-all group"
                                    >
                                        <div className="w-16 flex justify-center">
                                            <span className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg shadow-sm
                                                ${index === 0 ? "bg-amber-100 text-amber-600 border border-amber-200" :
                                                    index === 1 ? "bg-slate-200 text-slate-600 border border-slate-300" :
                                                    index === 2 ? "bg-orange-100 text-orange-600 border border-orange-200" :
                                                        "bg-white text-slate-400 border border-slate-100"}`}
                                            >
                                                {index + 1}
                                            </span>
                                        </div>

                                        <div className="flex-1 font-black text-slate-700 text-lg md:text-xl truncate px-4 group-hover:text-indigo-600 transition-colors uppercase italic">
                                            {g.title}
                                            <div className="text-[10px] text-slate-400 uppercase tracking-tighter block md:hidden">
                                                {g.templateType}
                                            </div>
                                        </div>

                                        <div className="w-36 text-right">
                                            <span className="bg-indigo-50 text-indigo-600 px-5 py-2 rounded-full text-xs font-black inline-block group-hover:bg-indigo-600 group-hover:text-white transition-all tracking-wide">
                                                ▶ {g.playCount || 0} plays
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )
                        ) : (
                            students.length === 0 ? (
                                <p className="text-center py-10 text-slate-400 font-bold">Belum ada data siswa teraktif.</p>
                            ) : (
                                students.map((s: any, index: number) => (
                                    <div
                                        key={s.id}
                                        className="flex items-center px-4 py-4 hover:bg-slate-50 rounded-[1.5rem] transition-all group"
                                    >
                                        <div className="w-16 flex justify-center">
                                            <span className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg shadow-sm
                                                ${index === 0 ? "bg-amber-100 text-amber-600 border border-amber-200" :
                                                    index === 1 ? "bg-slate-200 text-slate-600 border border-slate-300" :
                                                    index === 2 ? "bg-orange-100 text-orange-600 border border-orange-200" :
                                                        "bg-white text-slate-400 border border-slate-100"}`}
                                            >
                                                {index + 1}
                                            </span>
                                        </div>

                                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-200 ml-2 bg-slate-100 flex-shrink-0">
                                            <img
                                                src={getImageUrl(s.photoUrl)}
                                                alt={s.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        <div className="flex-1 font-black text-slate-700 text-lg md:text-xl truncate px-4 group-hover:text-indigo-600 transition-colors uppercase italic">
                                            {s.name}
                                            {s.schoolOrigin && (
                                                <div className="text-[10px] text-slate-400 font-bold normal-case tracking-normal block mt-0.5">
                                                    🏫 {s.schoolOrigin}
                                                </div>
                                            )}
                                        </div>

                                        <div className="w-36 text-right">
                                            <span className="bg-indigo-50 text-indigo-600 px-5 py-2 rounded-full text-xs font-black inline-block group-hover:bg-indigo-600 group-hover:text-white transition-all tracking-wide">
                                                🌟 {s.profile?.totalPoints || 0} XP
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}