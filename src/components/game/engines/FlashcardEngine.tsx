import { useState } from "react"

export default function FlashcardEngine({ cards }: any) {

    const [index, setIndex] = useState(0)
    const [flip, setFlip] = useState(false)

    const card = cards[index]

    return (

        <div className="text-center">

            <div
                onClick={() => setFlip(!flip)}
                className="border p-10 text-xl cursor-pointer"
            >
                {flip ? card.back : card.front}
            </div>

            <div className="flex justify-between mt-6">

                <button
                    onClick={() => setIndex(Math.max(index - 1, 0))}
                >
                    Prev
                </button>

                <button
                    onClick={() => setIndex(Math.min(index + 1, cards.length - 1))}
                >
                    Next
                </button>

            </div>

        </div>

    )

}