import { useEffect, useState } from "react"
import { getGames } from "../services/game.service"
// 🎯 Import tipe data Game jika sudah ada (biasanya di folder types)
// import { Game } from "../../types/game" 

export default function LeaderboardPage() {
    // 🛠️ FIX: Tambahkan tipe data <any[]> atau <Game[]> agar TypeScript tidak menganggapnya 'never'
    const [games, setGames] = useState<any[]>([]) 
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            try {
                const data = await getGames()
                
                // Pastikan data adalah array sebelum di-spread
                const gameList = Array.isArray(data) ? data : []
                
                // Urutkan berdasarkan playCount terbanyak (High to Low)
                const sortedGames = [...gameList].sort((a, b) => 
                    (b.playCount || 0) - (a.playCount || 0)
                )
                
                setGames(sortedGames)
            } catch (error) {
                console.error("Gagal memuat leaderboard:", error)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20 pt-24">
            {/* ... rest of your code ... */}
             <div className="max-w-4xl mx-auto px-6">
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 overflow-hidden">
                    {/* Custom Table Header */}
                    <div className="flex px-4 pb-6 border-b-2 border-slate-50 text-xs font-black text-slate-400 uppercase tracking-widest">
                        <div className="w-16 text-center">No</div>
                        <div className="flex-1">Nama Game</div>
                        <div className="w-32 text-right">Total Plays</div>
                    </div>

                    {/* List Games */}
                    <div className="pt-4 space-y-2">
                        {loading ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : games.length === 0 ? (
                            <p className="text-center py-10 text-slate-400 font-bold">Belum ada data game.</p>
                        ) : (
                            games.map((g: any, index: number) => (
                                <div
                                    key={g.id}
                                    className="flex items-center px-4 py-4 hover:bg-slate-50 rounded-[1.5rem] transition-all group"
                                >
                                    <div className="w-16 flex justify-center">
                                        <span className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg shadow-sm
                                            ${index === 0 ? "bg-amber-100 text-amber-600" :
                                                index === 1 ? "bg-slate-200 text-slate-600" :
                                                index === 2 ? "bg-orange-100 text-orange-600" :
                                                    "bg-white text-slate-400 border border-slate-100"}`}
                                        >
                                            {index + 1}
                                        </span>
                                    </div>

                                    <div className="flex-1 font-black text-slate-700 text-lg md:text-xl truncate px-4 group-hover:text-indigo-600 transition-colors">
                                        {g.title}
                                        <div className="text-[10px] text-slate-400 uppercase tracking-tighter block md:hidden">
                                            {g.templateType}
                                        </div>
                                    </div>

                                    <div className="w-32 text-right">
                                        <span className="bg-indigo-50 text-indigo-600 px-5 py-2 rounded-full text-sm font-black inline-block group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                            ▶ {g.playCount || 0}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}