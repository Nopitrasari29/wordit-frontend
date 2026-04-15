import { useEffect, useState } from "react"
import { getGames } from "../services/game.service"

export default function LeaderboardPage() {
    const [games, setGames] = useState([])

    useEffect(() => {
        async function load() {
            const data = await getGames()
            setGames(data)
        }
        load()
    }, [])

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20 pt-10">

            {/* HEADER */}
            <div className="text-center mb-12 px-6">
                <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight mb-4">
                    Game Terpopuler 🏆
                </h1>
                <p className="text-slate-500 font-bold text-lg">
                    Daftar game dengan jumlah pemain terbanyak.
                </p>
            </div>

            <div className="max-w-4xl mx-auto px-6">
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 overflow-hidden">

                    {/* Custom Table Header */}
                    <div className="flex px-4 pb-4 border-b-2 border-slate-100 text-sm font-black text-slate-400 uppercase tracking-widest">
                        <div className="w-16 text-center">No</div>
                        <div className="flex-1">Nama Game</div>
                        <div className="w-32 text-right">Total Plays</div>
                    </div>

                    {/* List Games */}
                    <div className="pt-2">
                        {games.length === 0 ? (
                            <p className="text-center py-10 text-slate-400 font-bold">Memuat data peringkat...</p>
                        ) : (
                            games.map((g: any, index: number) => (
                                <div
                                    key={g.id}
                                    className="flex items-center px-4 py-4 hover:bg-slate-50 rounded-2xl transition-colors border-b border-slate-50 last:border-0"
                                >
                                    <div className="w-16 flex justify-center">
                                        {/* Berikan gaya spesial untuk Top 3 */}
                                        <span className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg
                      ${index === 0 ? "bg-amber-100 text-amber-600" :
                                                index === 1 ? "bg-slate-200 text-slate-600" :
                                                    index === 2 ? "bg-orange-100 text-orange-600" :
                                                        "text-slate-400"}`}
                                        >
                                            {index + 1}
                                        </span>
                                    </div>

                                    <div className="flex-1 font-black text-slate-700 text-lg md:text-xl truncate px-2">
                                        {g.title}
                                    </div>

                                    <div className="w-32 text-right">
                                        <span className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-sm font-black inline-block">
                                            ▶ {g.playCount}
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