import { useState } from "react"

export default function MatchingPairEngine({ pairs }: any) {

    const [score, setScore] = useState(0)

    function match() {

        setScore(score + 1)

    }

    return (

        <div className="max-w-xl mx-auto">

            <h2 className="text-xl mb-4">
                Match the pairs
            </h2>

            <p className="mb-4">
                Score: {score}
            </p>

            {pairs.map((p: any, i: number) => (
                <div
                    key={i}
                    className="border p-4 mb-2 flex justify-between"
                >
                    <span>{p.left}</span>

                    <button
                        onClick={match}
                        className="bg-blue-500 text-white px-3"
                    >
                        Match
                    </button>

                </div>
            ))}

        </div>

    )

}