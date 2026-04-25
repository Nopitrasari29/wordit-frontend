import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

interface Flashcard {
    front: string;
    back: string;
}

interface FlashcardBuilderProps {
    initialData?: any; // Untuk mode Create (AI)
    value?: any;       // Untuk mode Edit (Database)
    onChange: (data: any) => void;
}

export default function FlashcardBuilder({ initialData, value, onChange }: FlashcardBuilderProps) {
    const [cards, setCards] = useState<Flashcard[]>([
        { front: "", back: "" }
    ]);

    // 🔥 SYNC LOGIC: Menangani mode Create (AI) dan mode Edit (Database)
    useEffect(() => {
        // Cek data dari value (Edit) atau initialData (Create/AI)
        const sourceData = value || initialData;
        const raw = sourceData?.cards || (Array.isArray(sourceData) ? sourceData : null);

        if (raw && raw.length > 0) {
            const mapped = raw.map((c: any) => ({
                front: c.front || c.word || c.question || "",
                back: c.back || c.answer || ""
            }));
            setCards(mapped);
        }
    }, [initialData, value]); // Pantau keduanya

    const updateCard = (index: number, field: keyof Flashcard, valueStr: string) => {
        const next = [...cards];
        next[index] = { ...next[index], [field]: valueStr };
        setCards(next);
        onChange({ cards: next });
    };

    const addRow = () => {
        const next = [...cards, { front: "", back: "" }];
        setCards(next);
        onChange({ cards: next });
    };

    // 🗑️ FUNGSI HAPUS BARIS
    const removeRow = (index: number) => {
        if (cards.length <= 1) {
            return toast.error("Minimal harus ada 1 kartu!");
        }
        const next = cards.filter((_, i) => i !== index);
        setCards(next);
        onChange({ cards: next });
        toast.success("Kartu dihapus 🗑️");
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 font-sans">
            <div className="grid grid-cols-1 gap-6">
                {cards.map((card, index) => (
                    <div key={index} className="group relative flex flex-col md:flex-row gap-4 bg-white border-2 border-slate-100 p-8 rounded-[3rem] hover:border-indigo-300 transition-all shadow-sm">

                        {/* 🔴 TOMBOL HAPUS (Muncul saat Hover) */}
                        <button
                            onClick={() => removeRow(index)}
                            className="absolute -top-3 -right-3 w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-90 z-20"
                            title="Hapus Kartu"
                        >
                            ✕
                        </button>

                        <div className="flex-1 space-y-2">
                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-4">Sisi Depan (Pertanyaan)</label>
                            <textarea
                                value={card.front}
                                onChange={(e) => updateCard(index, "front", e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-[2rem] focus:border-indigo-500 outline-none font-bold min-h-[100px] resize-none transition-all"
                                placeholder="Tulis soal di sini..."
                            />
                        </div>
                        <div className="flex-1 space-y-2">
                            <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest ml-4">Sisi Belakang (Jawaban)</label>
                            <textarea
                                value={card.back}
                                onChange={(e) => updateCard(index, "back", e.target.value)}
                                className="w-full bg-emerald-50/30 border-2 border-emerald-100 p-5 rounded-[2rem] focus:border-emerald-500 outline-none font-black text-emerald-700 min-h-[100px] resize-none transition-all"
                                placeholder="Tulis jawaban di sini..."
                            />
                        </div>
                    </div>
                ))}
            </div>

            <button onClick={addRow} className="w-full py-8 border-4 border-dashed border-slate-100 rounded-[3rem] text-slate-400 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all font-black text-lg">
                + Tambah Kartu Baru
            </button>
        </div>
    );
}