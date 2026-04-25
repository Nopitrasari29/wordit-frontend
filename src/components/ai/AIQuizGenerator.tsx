import { useState } from "react";
import { toast } from "react-hot-toast";
import { generateGameWithAI } from "../../pages/services/ai.service";

interface AIProps {
    level: string;
    template: string;
    onFinish: (data: any) => void;
}

export default function AIQuizGenerator({ level, template, onFinish }: AIProps) {
    const [topic, setTopic] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    // 🛠️ UNIVERSAL DATA ADAPTER (Mendukung semua template)
    const getNormalizedItems = (data: any) => {
        if (!data) return [];
        const raw = data.data || data;
        let items: any[] = [];

        // 1. Ambil data mentah dari berbagai kemungkinan key AI
        if (raw.cards) items = raw.cards;
        else if (raw.words) items = raw.words;
        else if (raw.questions) items = raw.questions;
        else if (typeof raw === 'object' && !Array.isArray(raw)) {
            // Jika formatnya soal1, soal2, dst.
            items = Object.keys(raw).filter(k => k.startsWith('soal') || !isNaN(Number(k))).map(k => raw[k]);
        } else if (Array.isArray(raw)) {
            items = raw;
        }

        return items;
    };

    async function generate() {
        if (topic.length < 3) return toast.error("Topik minimal 3 huruf ya!");
        setLoading(true);
        try {
            const response = await generateGameWithAI({
                topic,
                educationLevel: level as any,
                templateType: template as any
            });
            setResult(response);
            toast.success(`Magic Berhasil! Soal ${template} siap.`);
        } catch (err: any) {
            toast.error("Gagal generate soal AI. Cek koneksi.");
        } finally {
            setLoading(false);
        }
    }

    const previewItems = getNormalizedItems(result);

    return (
        <div className="bg-[#0f172a] p-8 md:p-12 rounded-[3rem] text-white shadow-2xl relative overflow-hidden border border-white/5 font-sans">
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
                        placeholder="Ketik topik kuis..."
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="flex-1 bg-white/10 border-2 border-white/5 px-8 py-4 rounded-full outline-none focus:border-indigo-500 transition-all font-bold text-lg text-white"
                    />
                    <button
                        onClick={generate}
                        disabled={loading}
                        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black px-10 py-4 rounded-full transition-all active:scale-95 whitespace-nowrap"
                    >
                        {loading ? "AI Lagi Mikir..." : "Generate Magic 🪄"}
                    </button>
                </div>

                {previewItems.length > 0 && (
                    <div className="space-y-6 pt-10 border-t border-white/10 animate-in fade-in">
                        <div className="flex justify-between items-center">
                            <p className="text-indigo-400 font-black text-xs uppercase tracking-widest">
                                Preview ({previewItems.length} Soal)
                            </p>
                            <button
                                onClick={() => {
                                    // 🚀 LOGIC CERDAS: Bungkus data sesuai kebutuhan template aktif
                                    const finalData: any = { template: template };

                                    if (template === "FLASHCARD") {
                                        finalData.cards = previewItems.map(item => ({
                                            front: item.front || item.word || item.question || "",
                                            back: item.back || item.answer || ""
                                        }));
                                    } else if (template === "MAZE_CHASE" || template === "SPIN_THE_WHEEL") {
                                        finalData.questions = previewItems;
                                    } else {
                                        // Untuk ANAGRAM, HANGMAN, WORD_SEARCH gunakan 'words'
                                        finalData.words = previewItems.map(item => ({
                                            word: item.word || item.front || item.answer || "",
                                            hint: item.hint || item.back || ""
                                        }));
                                    }

                                    onFinish(finalData);
                                    setResult(null);
                                    setTopic("");
                                }}
                                className="bg-emerald-500 hover:bg-emerald-400 text-white px-10 py-4 rounded-full font-black shadow-lg transition-all active:scale-95"
                            >
                                GUNAKAN SOAL ✓
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                            {previewItems.map((q: any, i: number) => (
                                <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-[2rem] flex items-start gap-4">
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-200 text-base">
                                            {q.front || q.word || q.question}
                                        </p>
                                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-2">
                                            Jawaban: {q.back || q.answer || q.word}
                                        </p>
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