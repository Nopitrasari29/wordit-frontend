import { useState } from "react"

export default function HangmanEngine() {
    const word = "BIOLOGY"
    const [guess, setGuess] = useState("")
    const [used, setUsed] = useState<string[]>([])

    function submit() {
        if (!guess) return
        setUsed([...used, guess])
        setGuess("")
    }

    return (
        <div className="flex flex-col items-center p-6 space-y-10 font-sans">
            <h2 className="text-3xl font-black text-slate-800">Hangman 🧗</h2>

            {/* DISPLAY WORD */}
            <div className="flex flex-wrap justify-center gap-2">
                {word.split("").map((l, i) => (
                    <div
                        key={i}
                        className={`w-12 h-14 border-b-8 flex items-center justify-center text-3xl font-black transition-all ${used.includes(l) ? 'border-emerald-500 text-emerald-600' : 'border-slate-200 text-transparent'
                            }`}
                    >
                        {used.includes(l) ? l : ""}
                    </div>
                ))}
            </div>

            <div className="w-full max-w-xs flex flex-col gap-4">
                <input
                    className="w-full bg-white border-4 border-slate-100 p-4 rounded-2xl text-center text-2xl font-black focus:border-amber-400 outline-none uppercase"
                    maxLength={1}
                    placeholder="?"
                    value={guess}
                    onChange={(e) => setGuess(e.target.value.toUpperCase())}
                />
                <button
                    onClick={submit}
                    className="bg-amber-400 hover:bg-amber-300 text-amber-900 font-black py-4 rounded-2xl text-xl shadow-lg transition-all"
                >
                    Tebak Huruf!
                </button>
            </div>

            <div className="text-center">
                <p className="text-slate-400 font-bold mb-2">Huruf yang sudah dicoba:</p>
                <div className="flex gap-2 justify-center flex-wrap">
                    {used.map((u, i) => (
                        <span key={i} className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full font-black uppercase">{u}</span>
                    ))}
                </div>
            </div>
        </div>
    )
}