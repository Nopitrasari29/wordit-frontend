import { useState, useEffect, useRef } from "react";

// 🎯 FIX: Gunakan prop 'value' dan 'onChange' agar sinkron dengan EditGamePage
export default function MazeChaseBuilder({ value, onChange }: any) {
    const [mazeSize, setMazeSize] = useState(10);
    const [words, setWords] = useState<any[]>([]);
    const hasMapped = useRef(false);

    // 📡 Sinkronisasi data dari Database (Parent) ke State Lokal (Child)
    useEffect(() => {
        // 🎯 FIX: Path data kuis Maze Chase di gameJson adalah 'words' dan 'mazeSize'
        const incomingWords = value?.words || [];
        const incomingSize = value?.mazeSize || 10;
        
        if ((incomingWords.length > 0 || incomingSize !== 10) && !hasMapped.current) {
            setWords(incomingWords);
            setMazeSize(incomingSize);
            hasMapped.current = true; // Mencegah data ter-reset saat sedang asik mengedit
        }
    }, [value]);

    const sync = (list: any[], size: number) => {
        setWords(list);
        setMazeSize(size);
        // 🎯 Lapor balik ke EditGamePage dalam bentuk objek gameJson yang flat
        onChange({ 
            words: list,
            mazeSize: size
        }); 
    };

    const updateField = (index: number, val: string) => {
        const next = [...words];
        next[index] = val;
        sync(next, mazeSize);
    };

    const addRow = () => {
        const next = [...words, ""];
        sync(next, mazeSize);
    };

    const removeRow = (index: number) => {
        const next = words.filter((_, i) => i !== index);
        sync(next, mazeSize);
    };

    return (
        <div className="space-y-10 animate-fade-in font-sans">
            {/* 1. CONFIG HEADER */}
            <div className="bg-indigo-50 p-8 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-6 border-2 border-indigo-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-full blur-3xl opacity-50"></div>
                
                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-4xl shadow-sm">🏃</div>
                    <div>
                        <h3 className="text-2xl font-black text-indigo-900 tracking-tight">Maze Chase Config</h3>
                        <p className="text-indigo-400 font-bold text-xs uppercase tracking-widest">Atur Ukuran Labirin & Target</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-white px-8 py-4 rounded-[2rem] shadow-sm relative z-10 border border-indigo-100">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Maze Size</label>
                    <input
                        type="number"
                        className="w-20 font-black text-indigo-600 outline-none text-2xl bg-transparent"
                        value={mazeSize}
                        onChange={(e) => {
                            const size = Number(e.target.value);
                            sync(words, size);
                        }}
                    />
                </div>
            </div>

            {/* 2. TARGET ANSWERS GRID */}
            <div className="space-y-4">
                <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] ml-6">Target Jawaban Benar</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {words.map((w, i) => (
                        <div key={i} className="flex gap-3 group animate-in slide-in-from-bottom-2 duration-300">
                            <div className="flex-1 relative">
                                <input
                                    className="w-full bg-white border-2 border-slate-100 px-8 py-5 rounded-[2rem] focus:border-indigo-500 focus:bg-white outline-none transition-all font-black text-slate-700 shadow-sm group-hover:border-indigo-200"
                                    placeholder={`Jawaban Benar #${i + 1}`}
                                    value={w}
                                    onChange={(e) => updateField(i, e.target.value)}
                                />
                                <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-black shadow-lg">
                                    {i + 1}
                                </div>
                            </div>
                            <button
                                onClick={() => removeRow(i)}
                                className="bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white px-6 rounded-[1.5rem] transition-all font-black active:scale-90"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. ADD BUTTON */}
            <button
                onClick={addRow}
                className="w-full py-10 border-4 border-dashed border-slate-200 rounded-[3.5rem] text-slate-400 font-black hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 transition-all flex items-center justify-center gap-3 group active:scale-[0.98]"
            >
                <span className="text-4xl group-hover:scale-125 transition-transform">+</span> 
                <span className="text-xl">Tambah Target Jawaban</span>
            </button>
        </div>
    );
}