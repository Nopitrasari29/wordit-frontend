import { useState } from "react"
import QuestionForm from "../../../components/game/forms/QuestionForm"
import QuestionList from "../../../components/game/forms/QuestionList"
import GameCreatorWizard from "../../../components/game/GameCreatorWizard"

type Question = {
    question: string
    answers?: string[]
    answer?: string
}

export default function AddQuestionsPage() {
    const [questions, setQuestions] = useState<Question[]>([])

    const addQuestion = (q: Question) => {
        setQuestions([...questions, q])
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-24 pt-8">

            <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">

                {/* WIZARD STEPPER */}
                <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100">
                    <GameCreatorWizard step={3} />
                </div>

                {/* HEADER TITLE */}
                <div className="text-center">
                    <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">
                        Susun Pertanyaanmu 📝
                    </h1>
                    <p className="text-slate-500 font-bold mt-2">
                        Tambahkan soal-soal seru untuk kuis ini.
                    </p>
                </div>

                {/* FORM TAMBAH SOAL */}
                <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-xl border-4 border-indigo-50 relative overflow-hidden">
                    {/* Pita Dekorasi */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-blue-400"></div>

                    <h2 className="text-xl font-black text-slate-800 mb-6">Tambah Soal Baru</h2>

                    <QuestionForm
                        template="quiz"
                        onAdd={addQuestion}
                    />
                </div>

                {/* LIST SOAL */}
                <div className="bg-slate-100/50 p-6 md:p-8 rounded-[2.5rem] border-2 border-slate-200 border-dashed">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-black text-slate-800">
                            Daftar Soal ({questions.length})
                        </h2>
                    </div>

                    {questions.length === 0 ? (
                        <div className="text-center py-10 bg-white rounded-[2rem] shadow-sm border border-slate-100">
                            <span className="text-5xl block mb-3">📭</span>
                            <p className="text-slate-500 font-bold">Belum ada pertanyaan. Yuk buat satu!</p>
                        </div>
                    ) : (
                        <QuestionList
                            questions={questions}
                        />
                    )}
                </div>

            </div>

        </div>
    )
}