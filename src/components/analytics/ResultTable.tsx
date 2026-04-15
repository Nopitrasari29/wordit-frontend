type Result = {
    player: string
    game: string
    score: number
    accuracy: number
}

type Props = {
    results: Result[]
}

export default function ResultTable({ results }: Props) {
    return (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 font-sans">
            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                🎮 Game Results
            </h3>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-50">
                            <th className="py-4 px-4 font-black text-slate-400 uppercase text-xs tracking-widest">Player</th>
                            <th className="py-4 font-black text-slate-400 uppercase text-xs tracking-widest">Game</th>
                            <th className="py-4 font-black text-slate-400 uppercase text-xs tracking-widest">Score</th>
                            <th className="py-4 font-black text-slate-400 uppercase text-xs tracking-widest">Accuracy</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {results.map((r, i) => (
                            <tr key={i} className="group hover:bg-slate-50 transition-colors">
                                <td className="py-5 px-4 font-bold text-slate-700">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-black uppercase">
                                            {r.player.charAt(0)}
                                        </div>
                                        {r.player}
                                    </div>
                                </td>
                                <td className="py-5 font-bold text-slate-600">{r.game}</td>
                                <td className="py-5">
                                    <span className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full font-black text-sm">
                                        {r.score}
                                    </span>
                                </td>
                                <td className="py-5">
                                    <span className={`px-4 py-1.5 rounded-full font-black text-sm ${r.accuracy >= 80 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                        }`}>
                                        {r.accuracy}%
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}