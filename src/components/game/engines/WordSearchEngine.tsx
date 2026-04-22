export default function WordSearchEngine({ data }: { data: any }) {
    const quizWords = data?.gameJson?.words || []
    const wordsOnly = quizWords.map((w: any) => w.word.toUpperCase())

    if (quizWords.length === 0) return (
        <div className="p-20 text-center text-slate-400 font-black italic uppercase tracking-widest">
            🔍 Belum ada kata...
        </div>
    )

    return (
        <div className="flex flex-col items-center p-10 space-y-12 font-sans w-full max-w-3xl mx-auto">
            <div className="text-center">
                <h2 className="text-4xl font-black text-slate-800 tracking-tighter italic">Find the Words 🔍</h2>
                <p className="text-indigo-400 font-black uppercase tracking-[0.3em] text-[10px] mt-2 text-center">Cari kata-kata di bawah pada grid</p>
            </div>

            <div className="grid grid-cols-5 gap-3 bg-white p-8 rounded-[4rem] shadow-2xl border-[12px] border-indigo-50">
                {Array.from({ length: 25 }).map((_, i) => (
                    <div key={i} className="w-14 h-14 bg-slate-50 text-slate-300 font-black flex items-center justify-center rounded-2xl text-2xl hover:bg-indigo-600 hover:text-white hover:scale-110 transition-all cursor-pointer shadow-inner">
                        {String.fromCharCode(65 + Math.floor(Math.random() * 26))}
                    </div>
                ))}
            </div>

            <div className="w-full bg-slate-900 p-10 rounded-[4rem] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
                <p className="text-white/40 font-black text-[10px] uppercase mb-6 text-center tracking-[0.4em]">Daftar Target:</p>
                <div className="flex flex-wrap justify-center gap-4">
                    {wordsOnly.map((w: string) => (
                        <div
                            key={w}
                            className="bg-white/10 text-white px-8 py-3 rounded-full font-black text-lg border-2 border-white/10 backdrop-blur-sm hover:bg-white hover:text-slate-900 transition-all"
                        >
                            {w}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}