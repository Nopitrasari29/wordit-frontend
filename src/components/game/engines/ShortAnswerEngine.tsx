import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { savePlayerScore } from "../../../pages/services/session.service"

export default function ShortAnswerEngine({ questions }: any) {

    const navigate = useNavigate()
    const { code } = useParams()

    const [index, setIndex] = useState(0)
    const [score, setScore] = useState(0)
    const [input, setInput] = useState("")

    const player =
        localStorage.getItem("player_name") || "Player"

    const q = questions[index]

    function submit() {

        let newScore = score

        if (
            input.trim().toLowerCase() ===
            q.answer.trim().toLowerCase()
        ) {
            newScore++
            setScore(newScore)
        }

        setInput("")

        if (index + 1 < questions.length) {

            setIndex(index + 1)

        } else {

            savePlayerScore(code!, {
                name: player,
                score: newScore
            })

            navigate(`/game/result?score=${newScore}`)

        }

    }

    return (

        <div className="max-w-xl mx-auto text-center">

            <p className="text-gray-500 mb-2">
                Question {index + 1} / {questions.length}
            </p>

            <h2 className="text-xl mb-6">
                {q.question}
            </h2>

            <input
                className="border p-3 w-full mb-4"
                placeholder="Type your answer"
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />

            <button
                onClick={submit}
                className="bg-blue-600 text-white px-6 py-3 rounded"
            >
                Submit
            </button>

            <p className="mt-6 text-gray-600">
                Score: {score}
            </p>

        </div>

    )

}