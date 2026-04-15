import { useState } from "react"

export default function HangmanBuilder({ value, onChange }: any) {

    const [words, setWords] = useState(value?.data?.words || [])

    function update(newWords: any) {

        setWords(newWords)

        onChange({

            data: { words: newWords }

        })

    }

    function add() {

        update([...words, { word: "", hint: "" }])

    }

    function change(i: number, key: string, val: string) {

        const copy = [...words]

        copy[i][key] = val

        update(copy)

    }

    return (

        <div>

            <h3>Hangman Words</h3>

            {words.map((w: any, i: number) => (

                <div key={i}>

                    <input
                        placeholder="word"
                        value={w.word}
                        onChange={(e) => change(i, "word", e.target.value)}
                    />

                    <input
                        placeholder="hint"
                        value={w.hint}
                        onChange={(e) => change(i, "hint", e.target.value)}
                    />

                </div>

            ))}

            <button onClick={add}>Add word</button>

        </div>

    )

}