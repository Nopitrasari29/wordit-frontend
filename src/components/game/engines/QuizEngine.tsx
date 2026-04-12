import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { savePlayerScore } from "../../../pages/services/session.service"

export default function QuizEngine({ questions }: any) {

    const navigate = useNavigate()
    const { code } = useParams()

    const [index, setIndex] = useState(0)
    const [score, setScore] = useState(0)

    const player =
        localStorage.getItem("player_name") || "Player"

    const q = questions[index]

    function answer(i: number) {

        let newScore = score

        if (i === q.correct) {
            newScore++
            setScore(newScore)
        }

        if (index + 1 < questions.length) {
            setIndex(index + 1)
        }
        else {

            savePlayerScore(code!, {
                name: player,
                score: newScore
            })

            navigate(`/game/result?score=${newScore}`)

        }

    }

    return (

        <div className="max-w-xl mx-auto text-center">

            <p className="mb-2 text-gray-500">
                Question {index + 1} / {questions.length}
            </p>

            <h2 className="text-xl mb-6">
                {q.question}
            </h2>

            <div className="grid grid-cols-2 gap-4">

                {q.answers.map((a: string, i: number) => (
                    <button
                        key={i}
                        onClick={() => answer(i)}
                        className="bg-blue-600 text-white p-4 rounded"
                    >
                        {a}
                    </button>
                ))}

            </div>

        </div>

    )

}