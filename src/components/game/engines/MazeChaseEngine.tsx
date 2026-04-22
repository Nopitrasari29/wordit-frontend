
export default function MazeChaseEngine({ data }: { data: any }) {
    return (
        <div className="flex flex-col items-center justify-center p-12 space-y-8 font-sans text-center w-full max-w-2xl mx-auto">
            <div className="bg-indigo-100 text-indigo-600 w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-5xl shadow-inner animate-bounce">
                🏃
            </div>
            <div>
                <h2 className="text-4xl font-black text-slate-800 tracking-tighter italic">Maze Chase</h2>
                <p className="text-indigo-400 font-black uppercase tracking-[0.3em] text-[10px] mt-2 italic">
                    "{data?.title || 'Game Maze'}"
                </p>
            </div>

            <div className="bg-slate-900 p-8 rounded-[4rem] shadow-2xl border-[12px] border-slate-800 w-full relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                {/* Visual Grid Arcade */}
                <div className="grid grid-cols-4 gap-4 text-4xl relative z-10">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className={`p-6 rounded-[2rem] shadow-inner transition-all duration-500 ${i === 5 ? 'bg-white scale-110 shadow-indigo-500/50' : 'bg-slate-800 opacity-30'}`}>
                            {i === 5 ? '🙂' : '🟦'}
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="bg-amber-50 border-2 border-amber-100 px-8 py-4 rounded-full flex items-center gap-3">
                <span className="animate-pulse">🚧</span>
                <p className="text-amber-600 font-black text-[10px] uppercase tracking-widest">
                    Fitur gameplay sedang dalam sinkronisasi AI
                </p>
            </div>
        </div>
    );
}