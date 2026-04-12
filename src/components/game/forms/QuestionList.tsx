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
            <p className="text-gray-500 text-sm">
                No questions added yet.
            </p>
        )

    }

    return (

        <div>

            <h2 className="font-bold mb-3">
                Questions
            </h2>

            <ul className="space-y-3">

                {questions.map((q, i) => (

                    <li
                        key={i}
                        className="border p-4 rounded-xl bg-white shadow-sm"
                    >

                        <p className="font-semibold mb-2">

                            {i + 1}. {q.question}

                        </p>

                        {q.answers && (

                            <ul className="text-sm text-gray-600 list-disc pl-5">

                                {q.answers.map((a, j) => (
                                    <li key={j}>{a}</li>
                                ))}

                            </ul>

                        )}

                        {q.answer && (

                            <p className="text-sm text-gray-500">
                                Answer: {q.answer}
                            </p>

                        )}

                    </li>

                ))}

            </ul>

        </div>

    )

}