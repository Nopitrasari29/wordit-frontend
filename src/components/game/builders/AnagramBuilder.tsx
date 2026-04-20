import { useState, useEffect, useRef } from "react";

export default function AnagramBuilder({ onChange, initialData }: any) {
    const [words, setWords] = useState<any[]>([]);
    const hasMapped = useRef(false);

    useEffect(() => {
        if (initialData && initialData.length > 0 && !hasMapped.current) {
            const mapped = initialData.map((item: any, index: number) => ({
                id: `word-${Date.now()}-${index}`,
                word: (item.word || "").toUpperCase().replace(/\s/g, ""),
                hint: item.hint || ""
            }));
            setWords(mapped);
            hasMapped.current = true;
        }
    }, [initialData]);

    const sync = (list: any[]) => {
        setWords(list);
        onChange({ words: list }); // LAPOR KE PARENT
    };

    const updateField = (index: number, key: string, val: string) => {
        const next = [...words];
        next[index] = { ...next[index], [key]: val };
        sync(next);
    };

    const addRow = () => {
        const next = [...words, { id: Date.now(), word: "", hint: "" }];
        sync(next);
    };

    const removeRow = (index: number) => {
        const next = words.filter((_, i) => i !== index);
        sync(next);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center px-4">
                <h2 className="text-2xl font-black italic">Anagram Editor 🧩</h2>
                <span className="bg-indigo-100 text-indigo-600 px-4 py-1 rounded-full font-black text-xs uppercase">
                    {words.length} Kata Dimuat
                </span>
            </div>

            <div className="space-y-4">
                {words.map((w, i) => (
                    <div key={w.id || i} className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-50 shadow-sm flex flex-col md:flex-row gap-6 items-center group hover:border-indigo-200 transition-all">
                        <div className="w-12 h-12 bg-slate-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-lg shrink-0">
                            {i + 1}
                        </div>
                        <div className="flex-1 w-full space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Kata Target (Jawaban)</p>
                            <input
                                value={w.word}
                                onChange={(e) => updateField(i, "word", e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-3 font-black text-slate-700 uppercase focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div className="flex-[2] w-full space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Petunjuk / Hint</p>
                            <input
                                value={w.hint}
                                onChange={(e) => updateField(i, "hint", e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-3 font-bold text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <button onClick={() => removeRow(i)} className="p-5 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all active:scale-90">
                            🗑️
                        </button>
                    </div>
                ))}
            </div>

            <button
                onClick={addRow}
                className="w-full py-8 border-4 border-dashed border-slate-200 rounded-[3rem] text-slate-400 font-black hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 transition-all flex items-center justify-center gap-3 group"
            >
                <span className="text-3xl">+</span> Tambah Kata Manual
            </button>
        </div>
    );
}