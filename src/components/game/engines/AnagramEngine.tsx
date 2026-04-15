import { useState } from "react"
import RankingOverlay from "../common/RankingOverlay"

export default function AnagramEngine({ data }: any) {
    const word = "PLANET"
    const shuffled = word.split("").sort(() => Math.random() - 0.5)

    const [answer, setAnswer] = useState("")
    const [score, setScore] = useState(0)

    function submit() {
        if (answer.toUpperCase() === word) {
            setScore(score + 10)
            alert("Correct! 🎉")
        } else {
            alert("Wrong ❌")
        }
    }

    return (
        <div className="flex flex-col items-center justify-center p-6 space-y-8 font-sans w-full max-w-2xl mx-auto">
            <div className="text-center">
                <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Arrange the Letters 🧩</h2>
                <p className="text-slate-500 font-bold">Susun huruf-huruf di bawah ini menjadi kata yang benar!</p>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
                {shuffled.map((letter, i) => (
                    <div key={i} className="w-14 h-14 md:w-16 md:h-16 bg-white border-4 border-indigo-100 rounded-2xl flex items-center justify-center text-3xl font-black text-indigo-600 shadow-sm animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}>
                        {letter}
                    </div>
                ))}
            </div>

            <div className="w-full flex flex-col items-center gap-4">
                <input
                    className="w-full max-w-md bg-slate-50 border-4 border-slate-100 px-6 py-4 rounded-3xl text-center text-2xl font-black text-slate-700 focus:border-indigo-500 outline-none transition-all uppercase placeholder:normal-case placeholder:font-medium"
                    placeholder="Ketik jawaban..."
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                />

                <button
                    onClick={submit}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xl px-12 py-4 rounded-3xl shadow-[0_10px_0_rgb(67,56,202)] hover:translate-y-1 hover:shadow-[0_6px_0_rgb(67,56,202)] active:translate-y-2 active:shadow-none transition-all uppercase tracking-widest"
                >
                    Submit! 🚀
                </button>
            </div>

            <RankingOverlay
                players={[
                    { name: "Andi", score: 100 },
                    { name: "Budi", score: 80 },
                    { name: "You", score: score }
                ]}
            />
        </div>
    )
}