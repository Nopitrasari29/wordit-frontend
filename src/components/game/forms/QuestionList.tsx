interface Question {
    id?: string;
    word?: string;
    hint?: string;
}

interface Props {
    questions: Question[];
    onDelete: (index: number) => void;
    onUpdate: (index: number, updatedItem: any) => void;
}

export default function QuestionList({ questions, onDelete, onUpdate }: Props) {
    return (
        <div className="space-y-4">
            {questions.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold">Belum ada soal. Tambah manual atau pakai AI di atas!</p>
                </div>
            ) : (
                questions.map((q, i) => (
                    <div
                        key={q.id || i}
                        className="bg-white p-8 rounded-[2.5rem] shadow-sm border-2 border-slate-50 flex items-center gap-6 relative group transition-all hover:border-indigo-100"
                    >
                        {/* Nomor Soal */}
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            {i + 1}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                            {/* INPUT KATA TARGET (JAWABAN) */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Kata Target (Jawaban)</label>
                                <input
                                    value={q.word || ""}
                                    onChange={(e) => onUpdate(i, { word: e.target.value })}
                                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-3 font-black text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
                                    placeholder="CONTOH"
                                />
                            </div>

                            {/* INPUT HINT / PETUNJUK */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Petunjuk / Hint</label>
                                <input
                                    value={q.hint || ""}
                                    onChange={(e) => onUpdate(i, { hint: e.target.value })}
                                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-3 font-bold text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="Masukkan petunjuk menebak kata..."
                                />
                            </div>
                        </div>

                        {/* TOMBOL HAPUS */}
                        <button
                            onClick={() => onDelete(i)}
                            className="p-4 bg-red-50 text-red-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white shadow-sm"
                            title="Hapus Soal"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                ))
            )}
        </div>
    );
}