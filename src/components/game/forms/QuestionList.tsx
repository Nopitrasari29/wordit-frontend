type Question = {
    question: string
    answers?: string[]
    answer?: string
}

type Props = {
    questions: Question[]
}

export default function QuestionList({ questions }: Props) {

    if (questions.length === 0) {
        return (
            <div className="bg-white p-10 rounded-[2rem] shadow-sm border border-slate-100 text-center font-sans">
                <div className="text-5xl mb-4 opacity-70">📭</div>
                <p className="text-slate-500 font-bold">No questions added yet. Yuk mulai tambahkan!</p>
            </div>
        )
    }

    return (
        <div className="font-sans">
            <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                Daftar Pertanyaan <span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-sm">{questions.length}</span>
            </h2>

            <div className="space-y-4">
                {questions.map((q, i) => (
                    <div
                        key={i}
                        className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all"
                    >
                        {/* Garis Aksen Kiri */}
                        <div className="absolute left-0 top-0 h-full w-2 bg-indigo-400"></div>

                        <div className="flex items-start gap-4 pl-2">
                            {/* Nomer Bulat */}
                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-black text-sm shrink-0 mt-1">
                                {i + 1}
                            </div>

                            <div className="flex-1">
                                <p className="font-black text-slate-800 text-lg mb-3">
                                    {q.question}
                                </p>

                                {/* Multiple Choice Answers */}
                                {q.answers && (
                                    <div className="flex flex-wrap gap-2">
                                        {q.answers.map((a, j) => (
                                            <span
                                                key={j}
                                                className={`px-4 py-1.5 rounded-full text-xs font-bold border ${j === 0 // Asumsi jawaban pertama adalah yang benar berdasarkan UI form sebelumnya
                                                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                        : "bg-slate-50 text-slate-600 border-slate-100"
                                                    }`}
                                            >
                                                {j === 0 ? `✓ ${a || 'Kosong'}` : a || 'Kosong'}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Short Answer */}
                                {q.answer && (
                                    <p className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-4 py-2 rounded-full text-sm font-bold inline-block">
                                        ✓ Jawaban: {q.answer}
                                    </p>
                                )}
                            </div>
                        </div>

                    </div>
                ))}
            </div>
        </div>
    )
}