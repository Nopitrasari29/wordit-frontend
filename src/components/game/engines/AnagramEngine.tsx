import { useState } from "react"

export default function AnagramEngine({ words }: any) {

    const [index, setIndex] = useState(0)
    const [input, setInput] = useState("")
    const [score, setScore] = useState(0)

    const word = words[index]

    function shuffle(w: string) {

        return w
            .split("")
            .sort(() => Math.random() - 0.5)
            .join("")

    }

    function submit() {

        if (input.toLowerCase() === word.toLowerCase()) {
            setScore(score + 1)
        }

        setInput("")

        if (index + 1 < words.length) {
            setIndex(index + 1)
        }
        else {
            alert(`Score: ${score}`)
        }

    }

    return (

        <div className="text-center">

            <h2 className="text-xl mb-6">
                Unscramble the word
            </h2>

            <p className="text-2xl mb-4">
                {shuffle(word)}
            </p>

            <input
                className="border p-2"
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />

            <button
                onClick={submit}
                className="bg-blue-600 text-white px-4 py-2 ml-2"
            >
                Submit
            </button>

        </div>

    )

}