import { useState, useEffect, useRef } from "react";

export default function SpinWheelBuilder({ value, onChange }: any) {
    const [questions, setQuestions] = useState<any[]>([]);
    const hasMapped = useRef(false);

    useEffect(() => {
        const dataObj = Array.isArray(value) ? value[0] : value;
        const incoming = dataObj?.questions || [];

        if (incoming.length > 0 && !hasMapped.current) {
            const mapped = incoming.map((item: any, index: number) => ({
                id: item.id || `spin-${Date.now()}-${index}`,
                question: item.question || "",
                answer: item.answer || ""
            }));
            setQuestions(mapped);
            hasMapped.current = true;
        }
    }, [value]);

    const sync = (list: any[]) => {
        setQuestions(list);
        onChange({
            template: "SPIN_THE_WHEEL",
            questions: list
        });
    };

    const updateField = (index: number, key: string, val: string) => {
        const next = [...questions];
        next[index] = { ...next[index], [key]: val };
        sync(next);
    };

    const addRow = () => {
        const next = [...questions, { id: Date.now(), question: "", answer: "" }];
        sync(next);
    };

    const removeRow = (index: number) => {
        const next = questions.filter((_, i) => i !== index);
        sync(next);
    };

    return (
        <div className="space-y-8 animate-fade-in font-sans">
            <div className="text-center bg-purple-50 p-10 rounded-[3.5rem] border-2 border-purple-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-purple-200 rounded-full blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
                <div className="w-24 h-24 bg-white text-purple-600 rounded-[2rem] flex items-center justify-center text-5xl mx-auto mb-6 shadow-xl relative z-10 animate-bounce">
                    🎡
                </div>
                <h3 className="text-3xl font-black text-purple-900 tracking-tight relative z-10 italic">Spin Wheel Builder</h3>
                <p className="text-purple-400 font-bold text-xs uppercase tracking-[0.2em] mt-2 relative z-10">Input pertanyaan dan jawaban untuk roda</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {questions.map((q, i) => (
                    <div key={q.id || i} className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-50 shadow-sm flex flex-col md:flex-row items-center gap-4 group hover:border-purple-300 transition-all duration-300">
                        <div className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center font-black shrink-0">
                            {i + 1}
                        </div>

                        <div className="flex-1 w-full space-y-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase ml-4 tracking-widest">Pertanyaan / Petunjuk</p>
                            <input
                                value={q.question}
                                onChange={(e) => updateField(i, "question", e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-700 focus:ring-2 focus:ring-purple-500 outline-none"
                                placeholder="CONTOH: Ibukota Perancis?"
                            />
                        </div>

                        <div className="flex-1 w-full space-y-1">
                            <p className="text-[9px] font-black text-purple-500 uppercase ml-4 tracking-widest">Jawaban (Wajib Tepat)</p>
                            <input
                                value={q.answer}
                                onChange={(e) => updateField(i, "answer", e.target.value)}
                                className="w-full bg-purple-50 border-none rounded-2xl px-6 py-4 font-black text-purple-700 focus:ring-2 focus:ring-purple-500 outline-none"
                                placeholder="Paris"
                            />
                        </div>

                        <button onClick={() => removeRow(i)} className="p-4 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all">
                            ✕
                        </button>
                    </div>
                ))}
            </div>

            <button
                onClick={addRow}
                className="w-full py-8 border-4 border-dashed border-slate-200 rounded-[3rem] text-slate-400 font-black hover:bg-purple-50 hover:text-purple-600 transition-all flex items-center justify-center gap-3 group"
            >
                <span className="text-3xl">+</span>
                <span className="text-lg uppercase">Tambah Soal Roda</span>
            </button>
        </div>
    );
}