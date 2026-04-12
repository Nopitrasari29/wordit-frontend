import { useState } from "react"

export default function ShortAnswerBuilder({ onSave }: any) {

    const [title, setTitle] = useState("")
    const [level, setLevel] = useState("SD")

    const [questions, setQuestions] = useState([
        { question: "", answer: "" }
    ])

    function updateQuestion(i: number, value: string) {

        const q = [...questions]
        q[i].question = value
        setQuestions(q)

    }

    function updateAnswer(i: number, value: string) {

        const q = [...questions]
        q[i].answer = value
        setQuestions(q)

    }

    function add() {

        setQuestions([
            ...questions,
            { question: "", answer: "" }
        ])

    }

    function publish() {

        onSave({
            template: "shortanswer",
            title,
            level,
            questions,
            status: "published"
        })

    }

    function saveDraft() {

        onSave({
            template: "shortanswer",
            title,
            level,
            questions,
            status: "draft"
        })

    }

    return (

        <div className="space-y-6">

            <h2 className="text-2xl font-bold">
                Create Short Answer
            </h2>

            <input
                className="border p-3 w-full"
                placeholder="Activity Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />

            {questions.map((q, i) => (
                <div key={i} className="grid grid-cols-2 gap-4">

                    <input
                        className="border p-2"
                        placeholder="Question"
                        value={q.question}
                        onChange={(e) => updateQuestion(i, e.target.value)}
                    />

                    <input
                        className="border p-2"
                        placeholder="Answer"
                        value={q.answer}
                        onChange={(e) => updateAnswer(i, e.target.value)}
                    />

                </div>
            ))}

            <button
                onClick={add}
                className="bg-gray-200 px-4 py-2"
            >
                Add Question
            </button>

            <div className="flex gap-4">

                <button
                    onClick={saveDraft}
                    className="bg-yellow-500 text-white px-6 py-2"
                >
                    Save Draft
                </button>

                <button
                    onClick={publish}
                    className="bg-blue-600 text-white px-6 py-2"
                >
                    Publish
                </button>

            </div>

        </div>

    )

}