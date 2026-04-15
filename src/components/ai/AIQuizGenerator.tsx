import { useState } from "react"

export default function AIQuizGenerator() {
    const [topic, setTopic] = useState("")
    const [questions, setQuestions] = useState<any[]>([])

    async function generate() {
        // Logic fetch asli kamu
        const res = await fetch("/api/ai/generate", { method: "POST" })
        const data = await res.json()
        setQuestions(data)
    }

    return (
        <div className="bg-slate-900 p-8 md:p-12 rounded-[3rem] text-white shadow-2xl relative overflow-hidden font-sans border border-white/5">
            {/* Dekorasi Cahaya */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10">
                <div className="mb-8">
                    <h2 className="text-3xl font-black mb-2 flex items-center gap-3 italic">
                        AI Quiz Generator <span className="text-indigo-400">✨</span>
                    </h2>
                    <p className="text-slate-400 font-bold">Buat puluhan pertanyaan otomatis dalam sekejap.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 mb-10">
                    <input
                        placeholder="Tulis topik... (Contoh: Tata Surya)"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="flex-1 bg-white/10 border-2 border-white/10 px-8 py-4 rounded-full outline-none focus:border-indigo-400 focus:bg-white/20 transition-all font-bold text-lg text-white placeholder:text-slate-500"
                    />
                    <button
                        onClick={generate}
                        className="bg-indigo-500 hover:bg-indigo-400 text-white font-black px-10 py-4 rounded-full shadow-lg shadow-indigo-900/40 transition-all active:scale-95"
                    >
                        Generate 🪄
                    </button>
                </div>

                {questions.length > 0 && (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                        <p className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">Hasil Generate:</p>
                        {questions.map((q, i) => (
                            <div
                                key={i}
                                className="bg-white/5 border border-white/10 p-5 rounded-2xl font-bold flex gap-4 hover:bg-white/10 transition-colors animate-fade-in-up"
                                style={{ animationDelay: `${i * 0.1}s` }}
                            >
                                <span className="text-indigo-400">#{i + 1}</span>
                                {q.question}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}