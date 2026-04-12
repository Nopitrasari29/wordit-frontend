import { useState } from "react";

export default function QuizBuilder({ onSave }: any) {

    const [title, setTitle] = useState("");
    const [level, setLevel] = useState("SD");
    const [difficulty, setDifficulty] = useState("easy");

    const [questions, setQuestions] = useState([
        {
            question: "",
            answers: ["", "", "", ""],
            correct: 0
        }
    ]);

    function updateQuestion(i: number, value: string) {

        const q = [...questions];
        q[i].question = value;
        setQuestions(q);

    }

    function updateAnswer(qi: number, ai: number, value: string) {

        const q = [...questions];
        q[qi].answers[ai] = value;
        setQuestions(q);

    }

    function setCorrect(qi: number, ai: number) {

        const q = [...questions];
        q[qi].correct = ai;
        setQuestions(q);

    }

    function addQuestion() {

        setQuestions([
            ...questions,
            {
                question: "",
                answers: ["", "", "", ""],
                correct: 0
            }
        ]);

    }

    function publish() {

        onSave({
            template: "quiz",
            title,
            level,
            difficulty,
            questions,
            status: "published"
        })

    }

    function saveDraft() {

        onSave({
            template: "quiz",
            title,
            level,
            difficulty,
            questions,
            status: "draft"
        })

    }

    return (

        <div className="space-y-6">

            <h2 className="text-2xl font-bold">
                Create Quiz
            </h2>

            <input
                className="border p-3 w-full"
                placeholder="Activity Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />

            <div className="flex gap-4">

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

                <select
                    className="border p-2"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                >
                    <option>easy</option>
                    <option>medium</option>
                    <option>hard</option>
                </select>

            </div>

            {questions.map((q, qi) => (

                <div key={qi} className="border p-4 rounded">

                    <input
                        className="border p-2 w-full mb-3"
                        placeholder="Question"
                        value={q.question}
                        onChange={(e) => updateQuestion(qi, e.target.value)}
                    />

                    {q.answers.map((a, ai) => (

                        <div key={ai} className="flex gap-2 mb-2">

                            <input
                                className="border p-2 flex-1"
                                placeholder={`Answer ${ai + 1}`}
                                value={a}
                                onChange={(e) => updateAnswer(qi, ai, e.target.value)}
                            />

                            <button
                                onClick={() => setCorrect(qi, ai)}
                                className={
                                    q.correct === ai
                                        ? "bg-green-500 text-white px-3"
                                        : "bg-gray-200 px-3"
                                }
                            >

                                ✓

                            </button>

                        </div>

                    ))}

                </div>

            ))}

            <button
                onClick={addQuestion}
                className="bg-gray-200 px-4 py-2 rounded"
            >
                Add Question
            </button>

            <div className="flex gap-4">

                <button
                    onClick={saveDraft}
                    className="bg-yellow-500 text-white px-6 py-2 rounded"
                >
                    Save Draft
                </button>

                <button
                    onClick={publish}
                    className="bg-blue-600 text-white px-6 py-2 rounded"
                >
                    Publish
                </button>

            </div>

        </div>

    )

}