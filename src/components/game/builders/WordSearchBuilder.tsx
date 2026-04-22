import { useState, useEffect, useRef } from "react";

// 🎯 FIX: Gunakan prop 'value' agar sinkron dengan EditGamePage
export default function WordSearchBuilder({ value, onChange }: any) {
    const [words, setWords] = useState<any[]>([]);
    const [gridSize, setGridSize] = useState(10);
    const hasMapped = useRef(false);

    // 📡 Sinkronisasi data dari Database (Parent) ke State Lokal (Child)
    useEffect(() => {
        // 🎯 FIX 1: Path data di gameJson adalah 'words' dan 'gridSize'
        const incomingWords = value?.words || [];
        const incomingSize = value?.gridSize || 10;
        
        if ((incomingWords.length > 0 || incomingSize !== 10) && !hasMapped.current) {
            // 🎯 PATEN: Pastikan semua data yang masuk diubah menjadi format objek { word: '...' }
            const mapped = incomingWords.map((item: any) => ({
                word: typeof item === 'string' ? item : (item.word || "")
            }));
            
            setWords(mapped);
            setGridSize(incomingSize);
            hasMapped.current = true; // Mencegah reset saat sedang asik mengetik
        }
    }, [value]);

    const sync = (list: any[], size: number) => {
        setWords(list);
        setGridSize(size);
        // 🎯 FIX 2: Lapor balik dalam format array objek agar tidak error 400 Bad Request
        onChange({ 
            words: list,
            gridSize: size 
        }); 
    };

    const updateField = (index: number, val: string) => {
        const next = [...words];
        // 🎯 FIX 3: Simpan sebagai objek agar sinkron dengan Engine
        next[index] = { word: val.toUpperCase().replace(/\s/g, "") }; 
        sync(next, gridSize);
    };

    const addRow = () => {
        // 🎯 Tambahkan baris baru sebagai objek kosong
        const next = [...words, { word: "" }];
        sync(next, gridSize);
    };

    const removeRow = (index: number) => {
        const next = words.filter((_, i) => i !== index);
        sync(next, gridSize);
    };

    return (
        <div className="space-y-10 animate-fade-in font-sans">
            {/* 1. HEADER & CONFIG */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-emerald-50 p-8 rounded-[3rem] border-2 border-emerald-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-full blur-3xl opacity-50"></div>
                
                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-16 h-16 bg-white text-emerald-600 rounded-2xl flex items-center justify-center text-4xl shadow-sm">🔍</div>
                    <div>
                        <h3 className="text-2xl font-black text-emerald-900 tracking-tight">Word Search Editor</h3>
                        <p className="text-emerald-500 font-bold text-xs uppercase tracking-widest italic">Patenkan kata tersembunyi</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-white px-8 py-4 rounded-[2rem] shadow-sm relative z-10 border border-emerald-100">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Grid Size</label>
                    <input
                        type="number"
                        className="w-16 font-black text-emerald-600 outline-none text-2xl bg-transparent text-center"
                        value={gridSize}
                        onChange={(e) => sync(words, Number(e.target.value))}
                    />
                </div>
            </div>

            {/* 2. WORDS GRID EDITOR */}
            <div className="space-y-4">
                <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] ml-6 text-center md:text-left">Daftar Kata Target</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-8 rounded-[3.5rem] border-2 border-slate-50 shadow-inner">
                    {words.map((w, i) => (
                        <div key={i} className="relative group animate-in zoom-in duration-300">
                            <input
                                className="w-full bg-slate-50 border-2 border-transparent px-4 py-4 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition-all font-black text-center uppercase tracking-widest text-slate-700 shadow-sm group-hover:border-emerald-200"
                                placeholder="..."
                                // 🎯 FIX 4: Gunakan w.word agar tidak muncul [OBJECT OBJECT]
                                value={w.word || ""} 
                                onChange={(e) => updateField(i, e.target.value)}
                            />
                            <button
                                onClick={() => removeRow(i)}
                                className="absolute -top-2 -right-2 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center text-xs font-black shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-90"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                    
                    <button
                        onClick={addRow}
                        className="bg-emerald-50 text-emerald-600 px-4 py-4 rounded-2xl font-black hover:bg-emerald-600 hover:text-white transition-all border-2 border-dashed border-emerald-200 flex items-center justify-center text-2xl"
                    >
                        +
                    </button>
                </div>
            </div>

            {/* 3. FOOTER INFO */}
            <div className="bg-slate-900 p-8 rounded-[3rem] text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <p className="text-emerald-400 font-black text-[10px] uppercase tracking-[0.3em] relative z-10">
                    Sistem akan otomatis mengacak kata-kata ini ke dalam grid {gridSize}x{gridSize}
                </p>
            </div>
        </div>
    );
}