import { useState } from "react"

type Question = {
    question: string
    answer: boolean
}

export default function TrueOrFalseBuilder({ onSave }: any) {

    const [title, setTitle] = useState("")
    const [level, setLevel] = useState("SD")

    const [questions, setQuestions] = useState<Question[]>([
        { question: "", answer: true }
    ])

    function updateQuestion(i: number, value: string) {

        const q = [...questions]
        q[i].question = value
        setQuestions(q)

    }

    function setAnswer(i: number, value: boolean) {

        const q = [...questions]
        q[i].answer = value
        setQuestions(q)

    }

    function addQuestion() {

        setQuestions([
            ...questions,
            { question: "", answer: true }
        ])

    }

    function publish() {

        onSave({
            template: "truefalse",
            title,
            level,
            questions,
            status: "published"
        })

    }

    function saveDraft() {

        onSave({
            template: "truefalse",
            title,
            level,
            questions,
            status: "draft"
        })

    }

    return (

        <div className="space-y-6">

            <h2 className="text-2xl font-bold">
                Create True or False
            </h2>

            <input
                className="border p-3 w-full"
                placeholder="Activity Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />

            <select
                className="border p-2"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
            >

                <option>SD</option>
                <option>SMP</option>
                <option>SMA</option>
                <option>UNIVERSITY</option>

            </select>

            {questions.map((q, i) => (
                <div key={i} className="border p-4 rounded">

                    <input
                        className="border p-2 w-full mb-3"
                        placeholder="Statement"
                        value={q.question}
                        onChange={(e) => updateQuestion(i, e.target.value)}
                    />

                    <div className="flex gap-4">

                        <button
                            onClick={() => setAnswer(i, true)}
                            className={
                                q.answer
                                    ? "bg-green-500 text-white px-4 py-1"
                                    : "bg-gray-200 px-4 py-1"
                            }
                        >
                            True
                        </button>

                        <button
                            onClick={() => setAnswer(i, false)}
                            className={
                                !q.answer
                                    ? "bg-red-500 text-white px-4 py-1"
                                    : "bg-gray-200 px-4 py-1"
                            }
                        >
                            False
                        </button>

                    </div>

                </div>
            ))}

            <button
                onClick={addQuestion}
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