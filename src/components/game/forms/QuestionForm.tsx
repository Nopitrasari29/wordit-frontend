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

        <div className="border p-4 rounded-xl bg-white shadow mb-4">

            <input
                placeholder="Question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="border p-2 w-full mb-3 rounded"
            />

            {(template === "quiz" || template === "truefalse") && (

                <div className="space-y-2">

                    {answers.map((a, i) => (

                        <input
                            key={i}
                            placeholder={`Answer ${i + 1}`}
                            value={a}
                            onChange={(e) => {

                                const newArr = [...answers]
                                newArr[i] = e.target.value
                                setAnswers(newArr)

                            }}
                            className="border p-2 w-full rounded"
                        />

                    ))}

                </div>

            )}

            {(template === "shortanswer") && (

                <input
                    placeholder="Correct Answer"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="border p-2 w-full rounded"
                />

            )}

            <button
                onClick={submit}
                className="bg-blue-600 text-white px-4 py-2 mt-3 rounded-lg hover:bg-blue-700 transition"
            >

                Add Question

            </button>

        </div>

    )

}