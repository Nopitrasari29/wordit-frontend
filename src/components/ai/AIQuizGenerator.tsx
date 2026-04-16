import { useState } from "react"

interface AIProps {
    level: string;
    template: string;
    onFinish: (data: any) => void;
}

export default function AIQuizGenerator({ level, template, onFinish }: AIProps) {
    const [topic, setTopic] = useState("")
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)

    async function generate() {
        if (topic.length < 5) return alert("Materi terlalu pendek!");
        setLoading(true)
        try {
            const res = await fetch("http://localhost:3000/api/ai/generate-quiz", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    topic,
                    educationLevel: level === "UNI" ? "UNIVERSITY" : level === "SD" ? "SD" : "SMP_SMA",
                    templateType: template
                })
            })
            const json = await res.json()
            if (json.success) setResult(json.data)
            else alert(json.message)
        } catch (err) {
            alert("Koneksi ke backend gagal.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-slate-900 p-8 md:p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden border border-white/5">
            {/* Dekorasi Magic */}
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-indigo-500/20 rounded-full blur-[100px]"></div>

            <div className="relative z-10">
                {/* Judul dikecilkan agar lebih profesional */}
                <div className="mb-10">
                    <h2 className="text-2xl md:text-4xl font-black mb-2 italic tracking-tight flex items-center gap-3">
                        Magic Generator <span className="text-indigo-400">✨</span>
                    </h2>
                    <p className="text-slate-400 font-bold text-sm">
                        AI akan merancang konten kuis berdasarkan materi yang Anda masukkan.
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 mb-10">
                    <input
                        placeholder="Masukkan materi (Contoh: Fotosintesis)..."
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="flex-1 bg-white/10 border-2 border-white/5 px-8 py-4 rounded-full outline-none focus:border-indigo-500 focus:bg-white/20 transition-all font-bold text-lg"
                    />
                    <button
                        onClick={generate}
                        disabled={loading}
                        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black px-10 py-4 rounded-full shadow-xl transition-all active:scale-95 whitespace-nowrap"
                    >
                        {loading ? "Magic Thinking..." : "Generate Soal 🪄"}
                    </button>
                </div>

                {result?.questions && (
                    <div className="animate-fade-in-up space-y-6 pt-10 border-t border-white/10">
                        <div className="flex justify-between items-center">
                            <p className="text-indigo-400 font-black text-xs uppercase tracking-widest">Preview ({result.questions.length} Soal)</p>
                            <button
                                onClick={() => onFinish(result.questions)}
                                className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-2.5 rounded-full font-black text-sm shadow-lg transition-all"
                            >
                                GUNAKAN SOAL ✓
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                            {result.questions.map((q: any, i: number) => (
                                <div key={i} className="bg-white/5 border border-white/5 p-5 rounded-[1.5rem] flex gap-4">
                                    <span className="text-indigo-400 font-black">#{i + 1}</span>
                                    <p className="font-bold text-slate-200 text-sm">{q.question}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}