import { useState, useEffect, useRef } from "react";

export default function HangmanBuilder({ value, onChange }: any) {
    const [words, setWords] = useState<any[]>([]);
    const hasMapped = useRef(false);

    useEffect(() => {
        const incomingWords = value?.words || [];
        if (incomingWords.length > 0 && !hasMapped.current) {
            const mapped = incomingWords.map((item: any, index: number) => ({
                id: item.id || `hangman-${Date.now()}-${index}`,
                word: (item.word || "").toUpperCase().trim(),
                hint: item.hint || ""
            }));
            setWords(mapped);
            hasMapped.current = true;
        }
    }, [value]);

    const sync = (list: any[]) => {
        setWords(list);
        onChange({ words: list });
    };

    const updateField = (index: number, key: string, val: string) => {
        const next = [...words];
        // 🛠️ VALIDASI: Hanya huruf, tanpa spasi
        let processedVal = val;
        if (key === "word") {
            processedVal = val.toUpperCase().replace(/[^A-Z]/g, "");
        }
        next[index] = { ...next[index], [key]: processedVal };
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
        <div className="space-y-6 animate-in fade-in duration-500 font-sans">
            <div className="flex justify-between items-center px-6">
                <h2 className="text-2xl font-black italic text-slate-800 tracking-tighter">Hangman Builder 🧗</h2>
                <div className="flex gap-2">
                    <span className="bg-indigo-50 text-indigo-600 px-4 py-1 rounded-full font-black text-[10px] uppercase shadow-sm">
                        {words.length} Kata
                    </span>
                </div>
            </div>

            <div className="space-y-4">
                {words.map((w, i) => (
                    <div key={w.id || i} className="bg-white p-6 rounded-[3rem] border-2 border-slate-50 shadow-sm flex flex-col md:flex-row gap-6 items-center group hover:border-indigo-200 transition-all duration-300">
                        <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center font-black text-xs group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            {i + 1}
                        </div>

                        <div className="flex-1 w-full space-y-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase ml-4 tracking-widest">Kata Kunci</p>
                            <input
                                value={w.word}
                                onChange={(e) => updateField(i, "word", e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-black text-slate-700 uppercase focus:ring-2 focus:ring-indigo-500 outline-none h-14"
                                placeholder="MISAL: INDONESIA"
                            />
                        </div>

                        <div className="flex-[2] w-full space-y-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase ml-4 tracking-widest">Petunjuk (Hint)</p>
                            <input
                                value={w.hint}
                                onChange={(e) => updateField(i, "hint", e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none h-14"
                                placeholder="Petunjuk untuk pemain..."
                            />
                        </div>

                        <button
                            onClick={() => removeRow(i)}
                            className="p-4 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-90"
                        >
                            🗑️
                        </button>
                    </div>
                ))}
            </div>

            <button
                onClick={addRow}
                className="w-full py-10 border-4 border-dashed border-slate-100 rounded-[3rem] text-slate-400 font-black hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all flex items-center justify-center gap-3 group"
            >
                <span className="text-2xl">+</span>
                <span>Tambah Kata Manual</span>
            </button>
        </div>
    );
}