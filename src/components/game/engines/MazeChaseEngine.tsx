export default function MazeChaseEngine() {
    return (
        <div className="flex flex-col items-center justify-center p-8 space-y-6 font-sans text-center">
            <div className="bg-blue-100 text-blue-600 w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-inner mb-2 animate-pulse">
                🏃
            </div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Maze Chase</h2>
            <p className="text-slate-500 font-bold max-w-xs">Gunakan tombol panah untuk lari dan kumpulkan jawaban yang benar!</p>

            <div className="bg-slate-900 p-4 rounded-[2rem] shadow-2xl border-8 border-slate-800">
                <div className="grid grid-cols-3 gap-2 text-4xl">
                    <div className="bg-slate-800 p-4 rounded-xl opacity-50">🟦</div>
                    <div className="bg-slate-800 p-4 rounded-xl opacity-50">🟦</div>
                    <div className="bg-slate-800 p-4 rounded-xl opacity-50">🟦</div>
                    <div className="bg-slate-800 p-4 rounded-xl opacity-50">🟦</div>
                    <div className="bg-white p-4 rounded-xl animate-bounce">🙂</div>
                    <div className="bg-slate-800 p-4 rounded-xl opacity-50">🟦</div>
                    <div className="bg-slate-800 p-4 rounded-xl opacity-50">🟦</div>
                    <div className="bg-slate-800 p-4 rounded-xl opacity-50">🟦</div>
                    <div className="bg-slate-800 p-4 rounded-xl opacity-50">🟦</div>
                </div>
            </div>
        </div>
    )
}