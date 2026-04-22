import { useState, useEffect, useRef } from "react";

// 🎯 FIX: Gunakan prop 'value' agar sinkron dengan EditGamePage
export default function HangmanBuilder({ value, onChange }: any) {
    const [words, setWords] = useState<any[]>([]);
    const hasMapped = useRef(false);

    // 📡 Sinkronisasi data dari Database (Parent) ke State Lokal (Child)
    useEffect(() => {
        // Path data kuis Hangman di gameJson adalah 'words'
        const incomingWords = value?.words || [];
        
        if (incomingWords.length > 0 && !hasMapped.current) {
            const mapped = incomingWords.map((item: any, index: number) => ({
                id: item.id || `hangman-${Date.now()}-${index}`,
                word: (item.word || "").toUpperCase().replace(/\s/g, ""),
                hint: item.hint || ""
            }));
            setWords(mapped);
            hasMapped.current = true; // Mencegah data ter-reset saat sedang mengedit
        }
    }, [value]);

    const sync = (list: any[]) => {
        setWords(list);
        // 🎯 Lapor balik ke EditGamePage dalam bentuk objek { words: list }
        onChange({ words: list }); 
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
        <div className="space-y-6 animate-fade-in font-sans">
            <div className="flex justify-between items-center px-4">
                <h2 className="text-2xl font-black italic text-slate-800">Hangman Editor 🧗</h2>
                <span className="bg-amber-100 text-amber-600 px-4 py-1 rounded-full font-black text-xs uppercase shadow-sm">
                    {words.length} Kata Dimuat
                </span>
            </div>

            <div className="space-y-4">
                {words.map((w, i) => (
                    <div key={w.id || i} className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-50 shadow-sm flex flex-col md:flex-row gap-6 items-center group hover:border-amber-200 hover:shadow-md transition-all duration-300">
                        <div className="w-12 h-12 bg-slate-50 text-amber-600 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                            {i + 1}
                        </div>
                        
                        <div className="flex-1 w-full space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Kata Rahasia</p>
                            <input
                                value={w.word}
                                onChange={(e) => updateField(i, "word", e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-black text-slate-700 uppercase focus:ring-2 focus:ring-amber-500 outline-none text-lg"
                                placeholder="CONTOH: DATABASE"
                            />
                        </div>

                        <div className="flex-[2] w-full space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Petunjuk Rahasia (Hint)</p>
                            <input
                                value={w.hint}
                                onChange={(e) => updateField(i, "hint", e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-500 focus:ring-2 focus:ring-amber-500 outline-none"
                                placeholder="Berikan petunjuk untuk membantu pemain..."
                            />
                        </div>

                        <button 
                            onClick={() => removeRow(i)} 
                            className="p-5 bg-rose-50 text-rose-500 rounded-3xl hover:bg-rose-500 hover:text-white transition-all active:scale-90 shadow-sm"
                        >
                            🗑️
                        </button>
                    </div>
                ))}
            </div>

            {/* Tombol Tambah Kata */}
            <button
                onClick={addRow}
                className="w-full py-10 border-4 border-dashed border-slate-200 rounded-[3rem] text-slate-400 font-black hover:bg-amber-50 hover:border-amber-300 hover:text-amber-600 transition-all flex items-center justify-center gap-3 group active:scale-[0.98]"
            >
                <span className="text-4xl group-hover:scale-125 transition-transform">+</span> 
                <span className="text-lg">Tambah Kata Manual</span>
            </button>
        </div>
    );
}