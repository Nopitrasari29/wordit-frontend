export default function WordSearchEngine() {
    const words = ["CAT", "DOG", "FISH"]

    return (
        <div className="flex flex-col items-center p-8 space-y-8 font-sans">
            <div className="text-center">
                <h2 className="text-3xl font-black text-slate-800 mb-2">Find the Words 🔍</h2>
                <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">Vocabulary Mission</p>
            </div>

            {/* GRID KOTAK PLACEHOLDER */}
            <div className="grid grid-cols-5 gap-2 bg-white p-4 rounded-[2rem] shadow-sm border border-slate-100">
                {Array.from({ length: 25 }).map((_, i) => (
                    <div key={i} className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 text-slate-400 font-bold flex items-center justify-center rounded-xl">
                        {String.fromCharCode(65 + Math.floor(Math.random() * 26))}
                    </div>
                ))}
            </div>

            <div className="w-full max-w-sm">
                <p className="text-slate-400 font-black text-sm uppercase mb-4 text-center">Daftar Kata:</p>
                <div className="flex flex-wrap justify-center gap-3">
                    {words.map(w => (
                        <div
                            key={w}
                            className="bg-indigo-100 text-indigo-600 px-6 py-2 rounded-full font-black text-lg border-2 border-indigo-200 shadow-sm"
                        >
                            {w}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}