import { useState, useEffect, useRef } from "react";

export default function WordSearchBuilder({ value, onChange }: any) {
    const [words, setWords] = useState<any[]>([]);
    const [gridSize, setGridSize] = useState(8);
    const hasMapped = useRef(false);

    useEffect(() => {
        // Mendukung data jika datang sebagai Array (dari DB) atau Object (state lokal)
        const dataObj = Array.isArray(value) ? value[0] : value;
        const incomingWords = dataObj?.words || [];
        const incomingSize = dataObj?.gridSize || 8;

        if (!hasMapped.current) {
            const mapped = incomingWords.map((item: any) => ({
                word: (typeof item === 'string' ? item : (item.word || "")).toUpperCase().replace(/[^A-Z]/g, ""),
                hint: typeof item === 'object' ? (item.hint || "") : ""
            }));
            setWords(mapped);
            setGridSize(incomingSize);
            hasMapped.current = true;
        }
    }, [value]);

    const sync = (list: any[], size: number) => {
        setWords(list);
        setGridSize(size);
        // 🔥 KIRIM OBJECT MURNI (Jangan dibungkus [] di sini)
        onChange({
            template: "WORD_SEARCH",
            words: list,
            gridSize: size
        });
    };

    const updateField = (index: number, val: string) => {
        const next = [...words];
        next[index] = { ...next[index], word: val.toUpperCase().replace(/[^A-Z]/g, "") };
        sync(next, gridSize);
    };

    const addRow = () => {
        const next = [...words, { word: "", hint: "" }];
        sync(next, gridSize);
    };

    const removeRow = (index: number) => {
        const next = words.filter((_, i) => i !== index);
        sync(next, gridSize);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 font-sans">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-emerald-50 p-6 rounded-[2.5rem] border-2 border-emerald-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white text-emerald-600 rounded-2xl flex items-center justify-center text-2xl shadow-sm">🔍</div>
                    <div>
                        <h3 className="text-xl font-black text-emerald-900 tracking-tight">Word Search Builder</h3>
                        <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Input kata untuk disembunyikan</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-sm border border-emerald-100">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ukuran Grid</label>
                    <input
                        type="number"
                        min={5}
                        max={12}
                        className="w-10 font-black text-emerald-600 outline-none text-xl bg-transparent text-center"
                        value={gridSize}
                        onChange={(e) => sync(words, Number(e.target.value))}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-6 rounded-[3rem] border-2 border-slate-50 shadow-inner">
                {words.map((w, i: number) => (
                    <div key={i} className="relative group animate-in zoom-in">
                        <input
                            className="w-full bg-slate-50 border-2 border-transparent px-4 py-4 rounded-xl focus:border-emerald-500 focus:bg-white outline-none transition-all font-black text-center uppercase text-sm text-slate-700"
                            placeholder="KATA..."
                            value={w.word || ""}
                            onChange={(e) => updateField(i, e.target.value)}
                        />
                        <button
                            onClick={() => removeRow(i)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                        >
                            ✕
                        </button>
                    </div>
                ))}
                <button
                    onClick={addRow}
                    className="bg-emerald-50 text-emerald-600 p-4 rounded-xl font-black hover:bg-emerald-600 hover:text-white transition-all border-2 border-dashed border-emerald-200 text-xl"
                >
                    +
                </button>
            </div>
        </div>
    );
}