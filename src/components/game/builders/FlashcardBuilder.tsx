import { useState, useEffect, useRef } from "react";

// 🎯 FIX: Gunakan prop 'value' dan 'onChange' agar sinkron dengan EditGamePage
export default function FlashcardBuilder({ value, onChange }: any) {
    const [cards, setCards] = useState<any[]>([]);
    const hasMapped = useRef(false);

    // 📡 Sinkronisasi data dari Database (Parent) ke State Lokal (Child)
    useEffect(() => {
        // 🎯 Path data kuis Flashcard adalah 'cards'
        const incomingCards = value?.cards || [];
        
        if (incomingCards.length > 0 && !hasMapped.current) {
            const mapped = incomingCards.map((item: any, index: number) => ({
                id: item.id || `card-${Date.now()}-${index}`,
                front: item.front || "",
                back: item.back || ""
            }));
            setCards(mapped);
            hasMapped.current = true; // Mencegah data ter-reset saat sedang mengedit
        }
    }, [value]);

    const sync = (list: any[]) => {
        setCards(list);
        // 🎯 Lapor balik ke EditGamePage dalam bentuk objek { cards: list }
        onChange({ 
            ...value,
            cards: list 
        }); 
    };

    const updateField = (index: number, key: string, val: string) => {
        const next = [...cards];
        next[index] = { ...next[index], [key]: val };
        sync(next);
    };

    const addRow = () => {
        const next = [...cards, { id: Date.now(), front: "", back: "" }];
        sync(next);
    };

    const removeRow = (index: number) => {
        const next = cards.filter((_, i) => i !== index);
        sync(next);
    };

    return (
        <div className="space-y-6 animate-fade-in font-sans">
            <div className="flex justify-between items-center px-4">
                <h2 className="text-2xl font-black italic text-slate-800">Flashcard Editor 🎴</h2>
                <span className="bg-indigo-100 text-indigo-600 px-4 py-1 rounded-full font-black text-xs uppercase shadow-sm">
                    {cards.length} Kartu Dimuat
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cards.map((c, i) => (
                    <div key={c.id || i} className="bg-white p-8 rounded-[3rem] border-2 border-slate-50 shadow-sm relative group hover:border-indigo-200 hover:shadow-xl transition-all duration-300">
                        {/* Tombol Hapus Kartu */}
                        <button
                            onClick={() => removeRow(i)}
                            className="absolute -top-3 -right-3 w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 font-black hover:scale-110 active:scale-90"
                        >
                            ✕
                        </button>

                        <div className="space-y-6">
                            {/* SISI DEPAN */}
                            <div>
                                <label className="text-[10px] font-black text-indigo-400 uppercase ml-4 mb-2 block tracking-widest">
                                    Sisi Depan (Pertanyaan)
                                </label>
                                <textarea
                                    className="w-full bg-slate-50 border-2 border-slate-100 px-6 py-4 rounded-[2rem] focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold resize-none h-24"
                                    placeholder="Tulis pertanyaan..."
                                    value={c.front}
                                    onChange={(e) => updateField(i, "front", e.target.value)}
                                />
                            </div>

                            {/* SISI BELAKANG */}
                            <div>
                                <label className="text-[10px] font-black text-emerald-400 uppercase ml-4 mb-2 block tracking-widest">
                                    Sisi Belakang (Jawaban)
                                </label>
                                <textarea
                                    className="w-full bg-emerald-50/30 border-2 border-emerald-100 px-6 py-4 rounded-[2rem] focus:border-emerald-500 focus:bg-white outline-none transition-all font-black text-emerald-700 resize-none h-24"
                                    placeholder="Tulis jawaban..."
                                    value={c.back}
                                    onChange={(e) => updateField(i, "back", e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tombol Tambah Kartu */}
            <button
                onClick={addRow}
                className="w-full py-10 border-4 border-dashed border-slate-200 rounded-[3.5rem] text-slate-400 font-black hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 transition-all flex items-center justify-center gap-3 group active:scale-[0.98]"
            >
                <span className="text-4xl group-hover:scale-125 transition-transform">+</span> 
                <span className="text-xl">Buat Kartu Baru</span>
            </button>
        </div>
    );
}