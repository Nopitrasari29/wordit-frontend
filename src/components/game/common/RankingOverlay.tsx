interface Player {
    name: string
    score: number
}

export default function RankingOverlay({ players, currentPlayerName }: { players: Player[], currentPlayerName?: string }) {
    // Logic sorting asli kamu
    const sorted = [...players].sort((a, b) => b.score - a.score)

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm font-sans animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-fade-in-up">

                {/* Header Overlay */}
                <div className="bg-indigo-600 p-8 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    <h3 className="text-3xl font-black tracking-tight relative z-10">Leaderboard 🏆</h3>
                </div>

                {/* List Peringkat */}
                <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
                    {sorted.map((p, i) => (
                        <div
                            key={i}
                            className={`
                                flex items-center justify-between p-4 rounded-2xl transition-all
                                ${p.name === currentPlayerName ? 'bg-indigo-50 border-2 border-indigo-300 shadow-md scale-105' : i === 0 ? 'bg-amber-50 border-2 border-amber-200 scale-105' : 'bg-slate-50 border-2 border-transparent'}
                            `}
                        >
                            <div className="flex items-center gap-4">
                                <span className={`
                                    w-8 h-8 rounded-full flex items-center justify-center font-black text-xs
                                    ${i === 0 ? 'bg-amber-400 text-amber-900' : 'bg-slate-200 text-slate-500'}
                                `}>
                                    {i + 1}
                                </span>
                                <span className="font-black text-slate-700 text-lg">{p.name}</span>
                            </div>
                            <span className="font-black text-indigo-600 bg-white px-4 py-1 rounded-full shadow-sm">
                                {p.score}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Footer / Tombol close jika dibutuhkan (Optional) */}
                <div className="p-4 text-center">
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Waktu bermain berakhir</p>
                </div>
            </div>
        </div>
    )
}