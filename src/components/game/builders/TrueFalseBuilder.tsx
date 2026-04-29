import { useState, useEffect } from "react";
import { Plus, Trash2, Check, X } from "lucide-react";

interface Question {
    question: string;
    correctAnswer: boolean | null;
}

interface Props {
    value: any;
    onChange: (data: any) => void;
    initialData?: any[];
}

export default function TrueFalseBuilder({ value, onChange, initialData }: Props) {
    const [questions, setQuestions] = useState<Question[]>(
        initialData || value?.questions || []
    );

    // Sync ke parent setiap kali ada perubahan
    useEffect(() => {
        onChange({ template: "TRUE_FALSE", questions });
    }, [questions]);

    const addQuestion = () => {
        setQuestions([...questions, { question: "", correctAnswer: null }]);
    };

    const updateQuestion = (index: number, val: string) => {
        const newQ = [...questions];
        newQ[index].question = val;
        setQuestions(newQ);
    };

    const setCorrectAnswer = (index: number, val: boolean) => {
        const newQ = [...questions];
        newQ[index].correctAnswer = val;
        setQuestions(newQ);
    };

    const removeQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-6 animate-fade-in font-sans">
            <div className="flex justify-between items-end mb-8 border-b-2 border-slate-100 pb-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">True / False</h2>
                    <p className="text-slate-400 font-bold mt-1 text-sm">Buat pernyataan dan tentukan apakah itu Benar atau Salah.</p>
                </div>
                <button
                    onClick={addQuestion}
                    className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-6 py-3 rounded-full font-black hover:bg-indigo-600 hover:text-white transition-all active:scale-95 border-2 border-indigo-100 hover:border-indigo-600"
                >
                    <Plus size={20} />
                    Tambah Pernyataan
                </button>
            </div>

            {questions.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <div className="text-5xl mb-4 grayscale opacity-40">⚖️</div>
                    <p className="text-slate-400 font-bold">Belum ada soal. Klik "Tambah Pernyataan" untuk memulai.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {questions.map((q, index) => (
                        <div key={index} className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm relative group hover:border-indigo-100 transition-colors flex flex-col md:flex-row gap-6 items-center">

                            {/* Delete Button */}
                            <button
                                onClick={() => removeQuestion(index)}
                                className="absolute -top-4 -right-4 bg-white text-rose-400 p-3 rounded-full shadow-lg border-2 border-rose-50 hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 z-10"
                                title="Hapus Soal"
                            >
                                <Trash2 size={20} />
                            </button>

                            <div className="bg-indigo-100 text-indigo-600 font-black w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-xl self-start">
                                {index + 1}
                            </div>

                            {/* Input Pernyataan */}
                            <div className="w-full">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Pernyataan</label>
                                <textarea
                                    value={q.question}
                                    onChange={(e) => updateQuestion(index, e.target.value)}
                                    placeholder="Ketik pernyataan di sini... (Contoh: Ibukota Indonesia adalah Jakarta)"
                                    className="w-full bg-slate-50 border-2 border-transparent px-6 py-4 rounded-3xl focus:bg-white focus:border-indigo-500 outline-none font-bold text-slate-700 resize-none transition-all"
                                    rows={2}
                                />
                            </div>

                            {/* Toggle Benar / Salah */}
                            <div className="shrink-0 flex flex-col gap-2 self-end pb-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center mb-1 block">Kunci Jawaban</label>
                                <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                                    <button
                                        onClick={() => setCorrectAnswer(index, true)}
                                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black transition-all ${q.correctAnswer === true
                                                ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
                                                : "text-slate-400 hover:text-emerald-500 hover:bg-emerald-50"
                                            }`}
                                    >
                                        <Check size={18} strokeWidth={3} />
                                        BENAR
                                    </button>
                                    <button
                                        onClick={() => setCorrectAnswer(index, false)}
                                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black transition-all ${q.correctAnswer === false
                                                ? "bg-rose-500 text-white shadow-md shadow-rose-200"
                                                : "text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                                            }`}
                                    >
                                        <X size={18} strokeWidth={3} />
                                        SALAH
                                    </button>
                                </div>
                                {q.correctAnswer === null && (
                                    <p className="text-rose-500 text-[10px] font-bold text-center mt-1">⚠️ Pilih jawaban</p>
                                )}
                            </div>

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}