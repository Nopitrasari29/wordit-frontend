import { useState } from "react"

export default function SpeedSortEngine({ items }: any) {

    const [score, setScore] = useState(0)

    function click() {

        setScore(score + 1)

    }

    return (

        <div className="text-center">

            <h2 className="text-xl mb-6">
                Speed Sort
            </h2>

            <p className="mb-4">
                Score: {score}
            </p>

            <div className="grid grid-cols-2 gap-4">

                {items.map((i: any, index: number) => (
                    <button
                        key={index}
                        onClick={click}
                        className="p-4 bg-blue-600 text-white"
                    >
                        {i.label}
                    </button>
                ))}

            </div>

        </div>

    )

}