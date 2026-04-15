export default function LeaderboardTable({ leaderboard }: any) {
  if (!leaderboard || leaderboard.length === 0) {
    return (
      <div className="bg-slate-50 p-10 rounded-[2.5rem] text-center border-2 border-dashed border-slate-200">
        <p className="text-slate-400 font-bold text-sm italic">
          No leaderboard data yet 📭
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden font-sans">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="p-5 font-black text-slate-400 uppercase text-xs tracking-widest text-center w-20">Rank</th>
            <th className="p-5 font-black text-slate-400 uppercase text-xs tracking-widest">Name</th>
            <th className="p-5 font-black text-slate-400 uppercase text-xs tracking-widest text-right pr-8">Score</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {leaderboard.map((p: any, i: number) => (
            <tr key={i} className="hover:bg-slate-50 transition-colors group">
              <td className="p-4 flex justify-center">
                <span className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-black text-sm
                    ${i === 0 ? 'bg-amber-100 text-amber-600 ring-4 ring-amber-50' :
                    i === 1 ? 'bg-slate-200 text-slate-600' :
                      i === 2 ? 'bg-orange-100 text-orange-600' : 'text-slate-400'}
                `}>
                  {i + 1}
                </span>
              </td>
              <td className="p-4 font-black text-slate-700">{p.name}</td>
              <td className="p-4 text-right pr-8">
                <span className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full font-black text-sm">
                  {p.score} XP
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}