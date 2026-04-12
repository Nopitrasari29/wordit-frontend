import { useState } from "react"

export default function TrueOrFalseEngine({ questions }: any) {

    const [index, setIndex] = useState(0)
    const [score, setScore] = useState(0)

    const q = questions[index]

    function answer(val: boolean) {

        if (val === q.answer) {
            setScore(score + 1)
        }

        if (index + 1 < questions.length) {
            setIndex(index + 1)
        }
        else {
            alert(`Game Finished! Score: ${score}`)
        }

    }

    return (

        <div className="text-center">

            <h2 className="text-xl mb-6">
                {q.question}
            </h2>

            <div className="flex justify-center gap-6">

                <button
                    onClick={() => answer(true)}
                    className="bg-green-600 text-white px-6 py-3"
                >
                    True
                </button>

                <button
                    onClick={() => answer(false)}
                    className="bg-red-600 text-white px-6 py-3"
                >
                    False
                </button>

            </div>

        </div>

    )

}