import { useState, useEffect } from "react";
import { Plus, Trash2, CheckCircle2, Circle } from "lucide-react";

interface Question {
    question: string;
    options: string[];
    correctAnswer: string;
}

interface Props {
    value: any;
    onChange: (data: any) => void;
    initialData?: any[];
}

export default function MultipleChoiceBuilder({ value, onChange, initialData }: Props) {
    const [questions, setQuestions] = useState<Question[]>(
        initialData || value?.questions || []
    );

    // Setiap kali questions berubah, kirim ke parent (CreateGamePage)
    useEffect(() => {
        onChange({ template: "MULTIPLE_CHOICE", questions });
    }, [questions]);

    const addQuestion = () => {
        setQuestions([
            ...questions,
            { question: "", options: ["", "", "", ""], correctAnswer: "" }
        ]);
    };

    const updateQuestion = (index: number, val: string) => {
        const newQ = [...questions];
        newQ[index].question = val;
        setQuestions(newQ);
    };

    const updateOption = (qIndex: number, optIndex: number, val: string) => {
        const newQ = [...questions];
        const oldVal = newQ[qIndex].options[optIndex];
        newQ[qIndex].options[optIndex] = val;

        // Jika opsi yang diubah ini tadinya adalah kunci jawaban, update juga kunci jawabannya
        if (newQ[qIndex].correctAnswer === oldVal) {
            newQ[qIndex].correctAnswer = val;
        }
        setQuestions(newQ);
    };

    const setCorrectAnswer = (qIndex: number, val: string) => {
        const newQ = [...questions];
        newQ[qIndex].correctAnswer = val;
        setQuestions(newQ);
    };

    const removeQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-6 animate-fade-in font-sans">
            <div className="flex justify-between items-end mb-8 border-b-2 border-slate-100 pb-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Multiple Choice</h2>
                    <p className="text-slate-400 font-bold mt-1 text-sm">Buat pertanyaan pilihan ganda dengan 4 opsi jawaban.</p>
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
                    <div className="text-5xl mb-4 grayscale opacity-40">📝</div>
                    <p className="text-slate-400 font-bold">Belum ada soal. Klik "Tambah Soal" untuk memulai.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {questions.map((q, qIndex) => (
                        <div key={qIndex} className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm relative group hover:border-indigo-100 transition-colors">

                            {/* Delete Button */}
                            <button
                                onClick={() => removeQuestion(qIndex)}
                                className="absolute -top-4 -right-4 bg-white text-rose-400 p-3 rounded-full shadow-lg border-2 border-rose-50 hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
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
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Pertanyaan</label>
                                        <textarea
                                            value={q.question}
                                            onChange={(e) => updateQuestion(qIndex, e.target.value)}
                                            placeholder="Ketik pertanyaan di sini..."
                                            className="w-full bg-slate-50 border-2 border-transparent px-6 py-4 rounded-3xl focus:bg-white focus:border-indigo-500 outline-none font-bold text-slate-700 resize-none transition-all"
                                            rows={2}
                                        />
                                    </div>

                                    {/* Opsi Jawaban */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {q.options.map((opt, optIndex) => {
                                            const isCorrect = q.correctAnswer === opt && opt !== "";
                                            const optionLabels = ["A", "B", "C", "D"];

                                            return (
                                                <div key={optIndex} className={`flex items-center gap-3 p-2 rounded-2xl border-2 transition-all ${isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-transparent hover:border-slate-200'}`}>

                                                    {/* Radio Button untuk Kunci Jawaban */}
                                                    <button
                                                        onClick={() => opt !== "" && setCorrectAnswer(qIndex, opt)}
                                                        className={`shrink-0 p-2 rounded-xl transition-all ${isCorrect ? 'text-emerald-500' : 'text-slate-300 hover:text-indigo-400'}`}
                                                        title={opt === "" ? "Isi opsi dulu" : "Jadikan Kunci Jawaban"}
                                                    >
                                                        {isCorrect ? <CheckCircle2 size={24} className="fill-emerald-100" /> : <Circle size={24} />}
                                                    </button>

                                                    <div className="flex w-full items-center gap-2">
                                                        <span className={`font-black text-sm ${isCorrect ? 'text-emerald-600' : 'text-slate-400'}`}>{optionLabels[optIndex]}.</span>
                                                        <input
                                                            type="text"
                                                            value={opt}
                                                            onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                                                            placeholder={`Opsi ${optionLabels[optIndex]}`}
                                                            className="w-full bg-transparent outline-none font-bold text-slate-600"
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {!q.correctAnswer && q.options.some(o => o !== "") && (
                                        <p className="text-rose-500 text-xs font-bold pl-4">⚠️ Jangan lupa pilih salah satu kunci jawaban dengan mengklik icon bulat.</p>
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