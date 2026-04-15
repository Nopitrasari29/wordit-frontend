import { useState } from "react"

type Question = {
    question: string
    answers?: string[]
    answer?: string
}

type Props = {
    template: "quiz" | "truefalse" | "shortanswer"
    onAdd: (q: Question) => void
}

export default function QuestionForm({ template, onAdd }: Props) {
    const [question, setQuestion] = useState("")
    const [answer, setAnswer] = useState("")
    const [answers, setAnswers] = useState(["", "", "", ""])

    const submit = () => {
        if (!question) return

        if (template === "quiz" || template === "truefalse") {
            onAdd({
                question,
                answers
            })
        } else {
            onAdd({
                question,
                answer
            })
        }

        setQuestion("")
        setAnswer("")
        setAnswers(["", "", "", ""])
    }

    return (
        <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-[2rem] shadow-sm mb-6 font-sans">

            <h3 className="text-lg font-black text-slate-800 mb-4">Tambahkan Pertanyaan</h3>

            <div className="space-y-4">
                {/* Input Soal Utama */}
                <input
                    placeholder="Tulis pertanyaan di sini..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="w-full bg-slate-50 text-slate-800 px-6 py-4 rounded-full border-2 border-slate-100 focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold placeholder:font-medium"
                />

                {/* Input Multiple Choice */}
                {(template === "quiz" || template === "truefalse") && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {answers.map((a, i) => (
                            <input
                                key={i}
                                placeholder={`Jawaban Pilihan ${i + 1}`}
                                value={a}
                                onChange={(e) => {
                                    const newArr = [...answers]
                                    newArr[i] = e.target.value
                                    setAnswers(newArr)
                                }}
                                className={`w-full px-6 py-3.5 rounded-full border-2 outline-none transition-all font-bold placeholder:font-medium ${i === 0
                                        ? "bg-emerald-50/50 border-emerald-100 focus:border-emerald-500 focus:bg-white text-emerald-800"
                                        : "bg-slate-50 border-slate-100 focus:border-indigo-500 focus:bg-white text-slate-800"
                                    }`}
                            />
                        ))}
                    </div>
                )}

                {/* Input Short Answer */}
                {(template === "shortanswer") && (
                    <input
                        placeholder="Jawaban Benar"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        className="w-full bg-emerald-50/50 text-emerald-800 px-6 py-4 rounded-full border-2 border-emerald-100 focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold placeholder:font-medium"
                    />
                )}

                <div className="flex justify-end pt-2">
                    <button
                        onClick={submit}
                        className="bg-slate-800 hover:bg-slate-700 text-white font-black px-8 py-3.5 rounded-full shadow-lg hover:shadow-slate-500/30 hover:-translate-y-1 transition-all active:scale-95"
                    >
                        + Add Question
                    </button>
                </div>
            </div>

        </div>
    )
}