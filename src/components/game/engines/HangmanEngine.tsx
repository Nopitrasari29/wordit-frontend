import { useState } from "react"

export default function HangmanEngine({ data }: { data: any }) {
    const quizWords = data?.gameJson?.words || []
    const [currentIndex, setCurrentIndex] = useState(0)
    const [used, setUsed] = useState<string[]>([])
    const [guess, setGuess] = useState("")

    const currentData = quizWords[currentIndex]
    const word = currentData?.word?.toUpperCase() || ""

    if (quizWords.length === 0) return (
        <div className="p-20 text-center text-slate-400 font-black italic uppercase tracking-widest">
            😵 Belum ada kata...
        </div>
    )

    function submit() {
        const char = guess.trim().toUpperCase()
        if (!char || used.includes(char)) return
        
        const newUsed = [...used, char]
        setUsed(newUsed)
        setGuess("")

        const isComplete = word.split("").every((l: string) => newUsed.includes(l))
        
        if (isComplete) {
            setTimeout(() => {
                if (currentIndex < quizWords.length - 1) {
                    setCurrentIndex(prev => prev + 1)
                    setUsed([])
                } else {
                    alert("Selamat! Kamu Juara Hangman! 🏆")
                }
            }, 300)
        }
    }

    return (
        <div className="flex flex-col items-center p-8 space-y-10 font-sans w-full max-w-2xl mx-auto">
            <div className="text-center space-y-4">
                <h2 className="text-4xl font-black text-slate-800 tracking-tighter italic">Hangman 🧗</h2>
                <div className="bg-amber-50 border-4 border-amber-100 px-8 py-4 rounded-[2.5rem] shadow-sm">
                    <p className="text-amber-700 font-black italic text-xl">"{currentData?.hint || "Cari katanya!"}"</p>
                </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
                {word.split("").map((l: string, i: number) => (
                    <div
                        key={i}
                        className={`w-14 h-16 border-b-[10px] flex items-center justify-center text-4xl font-black transition-all duration-500 ${
                            used.includes(l) ? 'border-indigo-500 text-indigo-600 scale-110' : 'border-slate-200 text-transparent'
                        }`}
                    >
                        {used.includes(l) ? l : ""}
                    </div>
                ))}
            </div>

            <div className="w-full max-w-sm space-y-4">
                <input
                    className="w-full bg-slate-50 border-4 border-slate-100 p-6 rounded-[2.5rem] text-center text-4xl font-black focus:border-indigo-500 focus:bg-white outline-none uppercase transition-all shadow-inner"
                    maxLength={1}
                    placeholder="?"
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submit()}
                />
                <button
                    onClick={submit}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-[2.5rem] text-xl shadow-lg shadow-indigo-100 active:scale-95 transition-all"
                >
                    TEBAK HURUF! 🚀
                </button>
            </div>

            <div className="w-full bg-white p-8 rounded-[3rem] border-2 border-slate-50 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-[0.2em]">History Huruf</p>
                <div className="flex gap-2 justify-center flex-wrap">
                    {used.map((u, i) => (
                        <span key={i} className="bg-slate-50 text-slate-400 px-4 py-2 rounded-xl font-black uppercase border border-slate-100">{u}</span>
                    ))}
                </div>
            </div>
        </div>
    )
}