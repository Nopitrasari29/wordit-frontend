import { useState } from "react"

export default function FlashcardBuilder({ onSave }: any) {

    const [title, setTitle] = useState("")
    const [level, setLevel] = useState("SD")

    const [cards, setCards] = useState([
        { front: "", back: "" }
    ])

    function updateFront(i: number, value: string) {

        const c = [...cards]
        c[i].front = value
        setCards(c)

    }

    function updateBack(i: number, value: string) {

        const c = [...cards]
        c[i].back = value
        setCards(c)

    }

    function addCard() {

        setCards([...cards, { front: "", back: "" }])

    }

    function publish() {

        onSave({
            template: "flashcard",
            title,
            level,
            cards,
            status: "published"
        })

    }

    function saveDraft() {

        onSave({
            template: "flashcard",
            title,
            level,
            cards,
            status: "draft"
        })

    }

    return (

        <div className="space-y-6">

            <h2 className="text-2xl font-bold">
                Create Flashcard
            </h2>

            <input
                className="border p-3 w-full"
                placeholder="Activity Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />

            {cards.map((card, i) => (
                <div key={i} className="grid grid-cols-2 gap-4">

                    <input
                        className="border p-2"
                        placeholder="Front"
                        value={card.front}
                        onChange={(e) => updateFront(i, e.target.value)}
                    />

                    <input
                        className="border p-2"
                        placeholder="Back"
                        value={card.back}
                        onChange={(e) => updateBack(i, e.target.value)}
                    />

                </div>
            ))}

            <button
                onClick={addCard}
                className="bg-gray-200 px-4 py-2"
            >
                Add Card
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