import { useState, useEffect } from "react";
import { Plus, Trash2, ArrowRight } from "lucide-react";

interface Pair {
    leftItem: string;
    rightItem: string;
}

interface Props {
    value: any;
    onChange: (data: any) => void;
    initialData?: any[];
}

export default function MatchingBuilder({ value, onChange, initialData }: Props) {
    // Inisialisasi state dari initialData, value, atau default 1 pasang kosong
    const [pairs, setPairs] = useState<Pair[]>(
        initialData || value?.pairs || [{ leftItem: "", rightItem: "" }]
    );

    // Sync ke parent setiap ada perubahan
    useEffect(() => {
        onChange({ template: "MATCHING", pairs });
    }, [pairs]);

    const addPair = () => {
        setPairs([...pairs, { leftItem: "", rightItem: "" }]);
    };

    const updatePair = (index: number, side: "leftItem" | "rightItem", val: string) => {
        const newPairs = [...pairs];
        newPairs[index][side] = val;
        setPairs(newPairs);
    };

    const removePair = (index: number) => {
        setPairs(pairs.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-6 animate-fade-in font-sans">
            <div className="flex justify-between items-end mb-8 border-b-2 border-slate-100 pb-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Matching (Pasangkan)</h2>
                    <p className="text-slate-400 font-bold mt-1 text-sm">Buat pasangan item antara kolom kiri dan kanan.</p>
                </div>
                <button
                    onClick={addPair}
                    className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-6 py-3 rounded-full font-black hover:bg-indigo-600 hover:text-white transition-all active:scale-95 border-2 border-indigo-100 hover:border-indigo-600"
                >
                    <Plus size={20} />
                    Tambah Pasangan
                </button>
            </div>

            {pairs.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <div className="text-5xl mb-4 grayscale opacity-40">🔗</div>
                    <p className="text-slate-400 font-bold">Belum ada pasangan. Klik "Tambah Pasangan" untuk memulai.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Header Kolom */}
                    <div className="hidden md:flex gap-4 px-16 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <div className="w-full">Item Sebelah Kiri (Soal)</div>
                        <div className="w-12 shrink-0"></div>
                        <div className="w-full">Item Sebelah Kanan (Jawaban)</div>
                    </div>

                    {pairs.map((pair, index) => (
                        <div key={index} className="bg-white p-6 rounded-[2rem] border-2 border-slate-100 shadow-sm relative group hover:border-indigo-100 transition-colors flex flex-col md:flex-row items-center gap-4">

                            {/* Nomor */}
                            <div className="bg-indigo-100 text-indigo-600 font-black w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg">
                                {index + 1}
                            </div>

                            {/* Input Kiri */}
                            <div className="w-full">
                                <label className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Item Kiri</label>
                                <input
                                    type="text"
                                    value={pair.leftItem}
                                    onChange={(e) => updatePair(index, "leftItem", e.target.value)}
                                    placeholder="Contoh: Ibukota Jawa Timur"
                                    className="w-full bg-slate-50 border-2 border-transparent px-6 py-4 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none font-bold text-slate-700 transition-all"
                                />
                            </div>

                            {/* Icon Panah (Visual Penghubung) */}
                            <div className="shrink-0 text-slate-300 md:rotate-0 rotate-90">
                                <ArrowRight size={24} strokeWidth={3} />
                            </div>

                            {/* Input Kanan */}
                            <div className="w-full">
                                <label className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Item Kanan</label>
                                <input
                                    type="text"
                                    value={pair.rightItem}
                                    onChange={(e) => updatePair(index, "rightItem", e.target.value)}
                                    placeholder="Contoh: Surabaya"
                                    className="w-full bg-emerald-50/50 border-2 border-transparent px-6 py-4 rounded-2xl focus:bg-white focus:border-emerald-500 outline-none font-bold text-emerald-700 transition-all placeholder:text-emerald-300/50"
                                />
                            </div>

                            {/* Delete Button */}
                            <button
                                onClick={() => removePair(index)}
                                className="absolute -top-3 -right-3 md:relative md:top-0 md:right-0 bg-white text-rose-400 p-3 rounded-full shadow-lg md:shadow-none border-2 border-rose-50 md:border-transparent hover:bg-rose-500 hover:text-white transition-all opacity-100 md:opacity-0 group-hover:opacity-100"
                                title="Hapus Pasangan"
                            >
                                <Trash2 size={20} />
                            </button>

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}