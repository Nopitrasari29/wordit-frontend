import { useState } from "react";
import { toast } from "react-hot-toast";
// ✅ FIX: Jalur diperbaiki agar masuk ke folder 'pages' dulu
import { generateGameWithAI } from "../../pages/services/ai.service"; 

interface AIProps {
    level: string;
    template: string;
    onFinish: (data: any[]) => void;
}

export default function AIQuizGenerator({ level, template, onFinish }: AIProps) {
    const [topic, setTopic] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const getItems = (data: any) => {
        if (!data) return [];
        return data.words || data.cards || data.questions || [];
    };

    async function generate() {
        if (topic.length < 3) return toast.error("Topik kependekan, Bro! Minimal 3 huruf ya.");
        
        setLoading(true);
        try {
            const data = await generateGameWithAI({
                topic,
                educationLevel: level as any,
                templateType: template as any
            });

            setResult(data);
            toast.success(`Magic Berhasil! Soal ${template} untuk level ${level} siap! ✨`);
        } catch (err: any) {
            toast.error(err.message || "Gagal konek ke server AI.");
        } finally {
            setLoading(false);
        }
    }

    const items = getItems(result);

    return (
        <div className="bg-[#0f172a] p-8 md:p-12 rounded-[3rem] text-white shadow-2xl relative overflow-hidden border border-white/5">
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px]"></div>

            <div className="relative z-10">
                <div className="mb-10">
                    <h2 className="text-3xl font-black mb-2 italic flex items-center gap-3">
                        Magic Generator <span className="text-indigo-400">✨</span>
                    </h2>
                    <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">
                        Merancang kuis {template} • Level {level}
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 mb-10">
                    <input
                        placeholder="Ketik topik kuis (Contoh: Jaringan Komputer)..."
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="flex-1 bg-white/10 border-2 border-white/5 px-8 py-4 rounded-full outline-none focus:border-indigo-500 transition-all font-bold text-lg text-white placeholder:text-slate-500"
                    />
                    <button
                        onClick={generate}
                        disabled={loading}
                        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black px-10 py-4 rounded-full shadow-xl transition-all active:scale-95 whitespace-nowrap"
                    >
                        {loading ? "AI Lagi Mikir..." : "Generate Magic 🪄"}
                    </button>
                </div>

                {items.length > 0 && (
                    <div className="space-y-6 pt-10 border-t border-white/10 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex justify-between items-center">
                            <p className="text-indigo-400 font-black text-xs uppercase tracking-widest">
                                Preview ({items.length} Soal)
                            </p>
                            <button
                                onClick={() => {
                                    onFinish(items);
                                    setResult(null);
                                    setTopic("");
                                }}
                                className="bg-emerald-500 hover:bg-emerald-400 text-white px-10 py-4 rounded-full font-black shadow-lg transition-all active:scale-95"
                            >
                                GUNAKAN SOAL ✓
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                            {items.map((q: any, i: number) => (
                                <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex items-start gap-5 hover:bg-white/10 transition-all group">
                                    <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center font-black shrink-0">
                                        #{i + 1}
                                    </div>

                                    <div className="flex-1">
                                        <p className="font-bold text-slate-200 text-base leading-relaxed mb-3">
                                            {q.hint || q.front || q.question}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                                                JAWABAN: {q.word || q.back || q.answer}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}