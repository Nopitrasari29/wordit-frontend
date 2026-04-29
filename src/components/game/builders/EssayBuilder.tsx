import { useState, useEffect } from "react";
import { Plus, Trash2, Tag, X } from "lucide-react";

interface Question {
    question: string;
    keywords: string[];
}

interface Props {
    value: any;
    onChange: (data: any) => void;
    initialData?: any[];
}

export default function EssayBuilder({ value, onChange, initialData }: Props) {
    const [questions, setQuestions] = useState<Question[]>(
        initialData || value?.questions || []
    );

    // State lokal untuk input teks keyword per soal sebelum di-Enter
    const [keywordInputs, setKeywordInputs] = useState<{ [key: number]: string }>({});

    useEffect(() => {
        onChange({ template: "ESSAY", questions });
    }, [questions]);

    const addQuestion = () => {
        setQuestions([...questions, { question: "", keywords: [] }]);
    };

    const updateQuestion = (index: number, val: string) => {
        const newQ = [...questions];
        newQ[index].question = val;
        setQuestions(newQ);
    };

    const removeQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index));
        // Bersihkan state input keyword yang terkait
        const newInputs = { ...keywordInputs };
        delete newInputs[index];
        setKeywordInputs(newInputs);
    };

    // --- LOGIKA KEYWORDS (TAGS) ---
    const handleKeywordChange = (index: number, val: string) => {
        setKeywordInputs({ ...keywordInputs, [index]: val });
    };

    const addKeyword = (index: number) => {
        const word = keywordInputs[index]?.trim();
        if (!word) return;

        const newQ = [...questions];
        // Cegah duplikasi keyword
        if (!newQ[index].keywords.includes(word.toLowerCase())) {
            newQ[index].keywords.push(word.toLowerCase());
            setQuestions(newQ);
        }
        // Kosongkan input setelah ditambah
        setKeywordInputs({ ...keywordInputs, [index]: "" });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addKeyword(index);
        }
    };

    const removeKeyword = (qIndex: number, keywordToRemove: string) => {
        const newQ = [...questions];
        newQ[qIndex].keywords = newQ[qIndex].keywords.filter((k) => k !== keywordToRemove);
        setQuestions(newQ);
    };

    return (
        <div className="space-y-6 animate-fade-in font-sans">
            <div className="flex justify-between items-end mb-8 border-b-2 border-slate-100 pb-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Smart Essay (AI Grading)</h2>
                    <p className="text-slate-400 font-bold mt-1 text-sm">Buat soal esai terbuka. AI akan menilai berdasarkan kata kunci (keywords) yang Anda berikan.</p>
                </div>
                <button
                    onClick={addQuestion}
                    className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-6 py-3 rounded-full font-black hover:bg-indigo-600 hover:text-white transition-all active:scale-95 border-2 border-indigo-100 hover:border-indigo-600"
                >
                    <Plus size={20} />
                    Tambah Soal
                </button>
            </div>

            {questions.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <div className="text-5xl mb-4 grayscale opacity-40">🤖</div>
                    <p className="text-slate-400 font-bold">Belum ada soal. Klik "Tambah Soal" untuk memulai.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {questions.map((q, qIndex) => (
                        <div key={qIndex} className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm relative group hover:border-indigo-100 transition-colors">

                            {/* Delete Button */}
                            <button
                                onClick={() => removeQuestion(qIndex)}
                                className="absolute -top-4 -right-4 bg-white text-rose-400 p-3 rounded-full shadow-lg border-2 border-rose-50 hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 z-10"
                                title="Hapus Soal"
                            >
                                <Trash2 size={20} />
                            </button>

                            <div className="flex gap-4 items-start">
                                <div className="bg-indigo-100 text-indigo-600 font-black w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-xl">
                                    {qIndex + 1}
                                </div>

                                <div className="w-full space-y-6">
                                    {/* Pertanyaan Input */}
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Pertanyaan Esai</label>
                                        <textarea
                                            value={q.question}
                                            onChange={(e) => updateQuestion(qIndex, e.target.value)}
                                            placeholder="Contoh: Jelaskan dampak pemanasan global terhadap ekosistem laut!"
                                            className="w-full bg-slate-50 border-2 border-transparent px-6 py-4 rounded-3xl focus:bg-white focus:border-indigo-500 outline-none font-bold text-slate-700 resize-none transition-all"
                                            rows={3}
                                        />
                                    </div>

                                    {/* Keywords Input Area */}
                                    <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100">
                                        <div className="flex items-center gap-2 mb-3 ml-2">
                                            <Tag size={16} className="text-indigo-400" />
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Kata Kunci (Rubrik AI)</label>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {q.keywords.map((keyword, kIndex) => (
                                                <div key={kIndex} className="bg-indigo-100 text-indigo-700 font-bold px-4 py-2 rounded-xl flex items-center gap-2 text-sm">
                                                    {keyword}
                                                    <button
                                                        onClick={() => removeKeyword(qIndex, keyword)}
                                                        className="hover:bg-indigo-200 p-1 rounded-full text-indigo-500 transition-colors"
                                                    >
                                                        <X size={14} strokeWidth={3} />
                                                    </button>
                                                </div>
                                            ))}
                                            {q.keywords.length === 0 && (
                                                <span className="text-sm font-bold text-slate-400 py-2">Belum ada kata kunci.</span>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={keywordInputs[qIndex] || ""}
                                                onChange={(e) => handleKeywordChange(qIndex, e.target.value)}
                                                onKeyDown={(e) => handleKeyDown(e, qIndex)}
                                                placeholder="Ketik kata kunci (lalu tekan Enter)..."
                                                className="w-full bg-white border-2 border-slate-200 px-6 py-3 rounded-2xl focus:border-indigo-500 outline-none font-bold text-slate-600 transition-all text-sm"
                                            />
                                            <button
                                                onClick={() => addKeyword(qIndex)}
                                                className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black hover:bg-indigo-500 transition-colors shrink-0 text-sm"
                                            >
                                                Tambah
                                            </button>
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 mt-3 ml-2">
                                            💡 Tip: Masukkan kata yang wajib ada di jawaban siswa agar AI memberikan nilai tinggi (contoh: "terumbu karang", "suhu naik", "pemutihan").
                                        </p>
                                    </div>

                                    {q.keywords.length === 0 && q.question.trim() !== "" && (
                                        <p className="text-rose-500 text-xs font-bold pl-4">⚠️ Tambahkan minimal 1 kata kunci agar AI bisa menilai jawaban secara akurat.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}