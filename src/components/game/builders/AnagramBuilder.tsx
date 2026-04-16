import { useState, useEffect, useRef } from "react";

interface AnagramBuilderProps {
    value?: any; // Mengambil data eksisting dari parent (untuk mode Edit)
    initialData?: any[]; // Data lemparan dari AI Generator
    onChange: (data: any) => void;
}

export default function AnagramBuilder({ value, onChange, initialData }: AnagramBuilderProps) {
    // Inisialisasi state dari value parent (jika ada) agar data tidak hilang saat pindah-pindah
    // Serta mendukung tampilan data yang sudah tersimpan di database saat mode EDIT
    const [words, setWords] = useState<any[]>(value?.words || []);

    // Ref untuk menandai apakah data AI sudah pernah diproses
    // Agar tidak terjadi pengulangan (infinite loop) saat komponen re-render
    const hasProcessedAI = useRef(false);

    // 1. SINKRONISASI DATA DARI AI
    useEffect(() => {
        if (initialData && initialData.length > 0 && !hasProcessedAI.current) {
            const mapped = initialData.map((q: any) => {
                // Mapping Logic: Mengambil teks jawaban benar dari format pilihan ganda AI
                // Jika kuis AI berbentuk { options: {A: "Kucing"...}, answer: "A" }
                const correctText = q.options && q.answer ? q.options[q.answer] : q.answer;

                return {
                    word: (correctText || "").toUpperCase().replace(/\s/g, ""), // Kapital & Tanpa Spasi
                    hint: q.question || "" // Pertanyaan dijadikan petunjuk/hint
                };
            });

            setWords(mapped);
            hasProcessedAI.current = true; // Tandai sudah diproses agar tidak tertimpa saat mengetik

            // Kirim balik ke parent (GameBuilderPage/GameEditPage)
            onChange({ words: mapped });
        }
    }, [initialData, onChange]);

    // 2. SINKRONISASI DATA DARI VALUE (MODE EDIT)
    // Memastikan jika data dari database datang setelah loading, state lokal ikut terupdate
    useEffect(() => {
        if (value?.words && value.words.length > 0 && words.length === 0) {
            setWords(value.words);
        }
    }, [value, words.length]);

    // Fungsi helper untuk update state dan notify parent sekaligus
    const handleUpdate = (newList: any[]) => {
        setWords(newList);
        onChange({ words: newList });
    };

    const updateField = (index: number, key: string, val: string) => {
        const next = [...words];
        // Update secara immutable untuk performa React yang baik
        next[index] = { ...next[index], [key]: val };
        handleUpdate(next);
    };

    const addRow = () => handleUpdate([...words, { word: "", hint: "" }]);

    const removeRow = (index: number) => {
        const filtered = words.filter((_, i) => i !== index);
        handleUpdate(filtered);
    };

    return (
        <div className="space-y-8 font-sans">
            {/* HEADER EDITOR */}
            <div className="flex justify-between items-center px-2">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                    Anagram Editor <span className="text-2xl">🧩</span>
                </h3>
                <span className="bg-indigo-100 text-indigo-600 px-5 py-2 rounded-full font-black text-xs uppercase tracking-widest border border-indigo-200">
                    {words.length} Words Loaded
                </span>
            </div>

            {/* LIST INPUT AREA */}
            <div className="space-y-5">
                {words.length === 0 ? (
                    <div className="text-center py-20 border-4 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/50 animate-pulse">
                        <p className="text-slate-400 font-bold">
                            Belum ada kata. Gunakan AI Generator di atas atau tambah manual.
                        </p>
                    </div>
                ) : (
                    words.map((w, i) => (
                        <div
                            key={i}
                            className="flex flex-col md:flex-row gap-5 p-6 bg-white rounded-[2.5rem] border-2 border-slate-50 hover:border-indigo-100 transition-all group shadow-sm hover:shadow-md"
                        >
                            {/* Index Number Badge */}
                            <div className="w-12 h-12 bg-slate-50 text-indigo-500 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                {i + 1}
                            </div>

                            {/* Input Kata Target */}
                            <div className="flex-1 space-y-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase ml-5 tracking-[0.2em]">Kata Target</p>
                                <input
                                    className="w-full bg-slate-50 border-2 border-transparent px-7 py-4 rounded-full focus:border-indigo-500 focus:bg-white outline-none transition-all font-black text-slate-700 uppercase placeholder:text-slate-300"
                                    value={w.word}
                                    onChange={(e) => updateField(i, "word", e.target.value)}
                                    placeholder="CONTOH"
                                />
                            </div>

                            {/* Input Hint / Petunjuk */}
                            <div className="flex-[2] space-y-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase ml-5 tracking-[0.2em]">Petunjuk / Hint</p>
                                <input
                                    className="w-full bg-slate-50 border-2 border-transparent px-7 py-4 rounded-full focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-500 placeholder:text-slate-300"
                                    value={w.hint}
                                    onChange={(e) => updateField(i, "hint", e.target.value)}
                                    placeholder="Masukkan petunjuk menebak kata..."
                                />
                            </div>

                            {/* Delete Action */}
                            <button
                                onClick={() => removeRow(i)}
                                className="self-center md:self-end mb-1 w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center text-xl shadow-sm active:scale-90"
                                title="Hapus baris"
                            >
                                🗑️
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* ADD BUTTON */}
            <button
                onClick={addRow}
                className="w-full py-7 border-4 border-dashed border-slate-200 rounded-[3rem] text-slate-400 font-black hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 transition-all flex items-center justify-center gap-3 group"
            >
                <span className="text-3xl group-hover:scale-125 transition-transform">+</span> Tambah Kata Manual
            </button>
        </div>
    );
}