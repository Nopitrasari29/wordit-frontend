import { useState, useEffect, useRef } from "react";

// 🎯 FIX: Gunakan prop 'value' agar sinkron dengan EditGamePage
export default function SpinWheelBuilder({ value, onChange }: any) {
    const [questions, setQuestions] = useState<any[]>([]);
    const hasMapped = useRef(false);

    // 📡 Sinkronisasi data dari Database (Parent) ke State Lokal (Child)
    useEffect(() => {
        // 🎯 FIX: Gunakan 'questions' agar sinkron dengan SpinWheelEngine.tsx
        const incoming = value?.questions || [];
        
        if (incoming.length > 0 && !hasMapped.current) {
            const mapped = incoming.map((item: any, index: number) => ({
                id: item.id || `spin-${Date.now()}-${index}`,
                question: item.question || "",
                answer: item.answer || "" // Opsional untuk jawaban spin
            }));
            setQuestions(mapped);
            hasMapped.current = true; // Mencegah reset saat sedang asik ngetik
        }
    }, [value]);

    const sync = (list: any[]) => {
        setQuestions(list);
        // 🎯 Lapor balik ke EditGamePage dalam bentuk objek { questions: list }
        onChange({ questions: list }); 
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
            {/* 1. HEADER EDITOR */}
            <div className="text-center bg-purple-50 p-10 rounded-[3.5rem] border-2 border-purple-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-purple-200 rounded-full blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
                <div className="w-24 h-24 bg-white text-purple-600 rounded-[2rem] flex items-center justify-center text-5xl mx-auto mb-6 shadow-xl shadow-purple-100 relative z-10 animate-bounce">
                    🎡
                </div>
                <h3 className="text-3xl font-black text-purple-900 tracking-tight relative z-10 italic">Wheel Options</h3>
                <p className="text-purple-400 font-bold text-xs uppercase tracking-[0.2em] mt-2 relative z-10">Tuliskan pilihan yang akan muncul di roda</p>
            </div>

            {/* 2. OPTIONS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {questions.map((q, i) => (
                    <div key={q.id || i} className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-50 shadow-sm flex items-center gap-4 group hover:border-purple-300 hover:shadow-xl transition-all duration-300 relative">
                        <div className="w-12 h-12 bg-slate-50 text-purple-600 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                            {i + 1}
                        </div>
                        
                        <div className="flex-1 space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Label / Pertanyaan</p>
                            <input
                                value={q.question}
                                onChange={(e) => updateField(i, "question", e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-black text-slate-700 focus:ring-2 focus:ring-purple-500 outline-none text-lg"
                                placeholder="CONTOH: HADIAH A"
                            />
                        </div>

                        <button 
                            onClick={() => removeRow(i)} 
                            className="p-4 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all active:scale-90"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>

            {/* 3. ADD BUTTON */}
            <button
                onClick={addRow}
                className="w-full py-10 border-4 border-dashed border-slate-200 rounded-[3.5rem] text-slate-400 font-black hover:bg-purple-50 hover:border-purple-300 hover:text-purple-600 transition-all flex items-center justify-center gap-3 group active:scale-[0.98]"
            >
                <span className="text-4xl group-hover:scale-125 transition-transform">+</span> 
                <span className="text-xl">Tambah Pilihan Roda</span>
            </button>
        </div>
    );
}