import { useState, useEffect, useRef } from "react";

export default function MazeChaseBuilder({ value, onChange }: any) {
    const [questions, setQuestions] = useState<any[]>([]);
    const hasMapped = useRef(false);

    useEffect(() => {
        // Ambil data dari questions atau words
        const dataObj = Array.isArray(value) ? value[0] : value;
        const incoming = dataObj?.questions || dataObj?.words || [];

        if (!hasMapped.current && incoming.length > 0) {
            const mapped = incoming.map((item: any) => ({
                question: item.question || item.hint || "",
                answer: item.answer || item.word || ""
            }));
            setQuestions(mapped);
            hasMapped.current = true;
        }
    }, [value]);

    const sync = (list: any[]) => {
        setQuestions(list);
        // 🔥 Kirim sebagai 'questions' agar sesuai Schema Backend
        onChange({
            template: "MAZE_CHASE",
            questions: list
        });
    };

    const updateField = (index: number, field: 'question' | 'answer', val: string) => {
        const next = [...questions];
        next[index][field] = val;
        sync(next);
    };

    const addRow = () => sync([...questions, { question: "", answer: "" }]);
    const removeRow = (index: number) => sync(questions.filter((_, i) => i !== index));

    return (
        <div className="space-y-8 animate-fade-in font-sans">
            <div className="bg-indigo-50 p-6 rounded-[2.5rem] border-2 border-indigo-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm">🏃</div>
                <div>
                    <h3 className="text-xl font-black text-indigo-900 tracking-tight">Maze Chase Builder</h3>
                    <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest">Pemain harus menabrak jawaban yang benar</p>
                </div>
            </div>

            <div className="space-y-4">
                {questions.map((q, i) => (
                    <div key={i} className="flex flex-col md:flex-row gap-4 bg-white p-6 rounded-[2rem] border-2 border-slate-50 shadow-sm relative group">
                        <div className="flex-1 space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Pertanyaan</label>
                            <input
                                className="w-full bg-slate-50 border-2 border-transparent px-6 py-3 rounded-xl focus:border-indigo-500 outline-none font-bold"
                                value={q.question}
                                onChange={(e) => updateField(i, 'question', e.target.value)}
                                placeholder="Contoh: Apa warna langit?"
                            />
                        </div>
                        <div className="flex-1 space-y-2">
                            <label className="text-[9px] font-black text-emerald-500 uppercase tracking-widest ml-2">Jawaban Benar</label>
                            <input
                                className="w-full bg-emerald-50 border-2 border-transparent px-6 py-3 rounded-xl focus:border-emerald-500 outline-none font-black text-emerald-700"
                                value={q.answer}
                                onChange={(e) => updateField(i, 'answer', e.target.value)}
                                placeholder="Biru"
                            />
                        </div>
                        <button onClick={() => removeRow(i)} className="md:mt-6 bg-rose-50 text-rose-500 p-3 rounded-xl hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100">✕</button>
                    </div>
                ))}
            </div>

            <button onClick={addRow} className="w-full py-6 border-4 border-dashed border-slate-100 rounded-[2rem] text-slate-400 font-black hover:bg-indigo-50 transition-all">+ Tambah Pertanyaan</button>
        </div>
    );
}