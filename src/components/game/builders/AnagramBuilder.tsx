import { useState } from "react"

export default function AnagramBuilder({ value, onChange }: any) {

    const [words, setWords] = useState(value?.data?.words || [])

    function update(newWords: any) {

        setWords(newWords)

        onChange({
            data: {
                words: newWords
            }
        })
    }

    function addWord() {

        update([...words, { word: "", hint: "" }])

    }

    function updateWord(index: number, key: string, val: string) {

        const updated = [...words]

        updated[index][key] = val

        update(updated)

    }

    function remove(index: number) {

        update(words.filter((_: any, i: number) => i !== index))

    }

    return (

        <div>

            <h3>Anagram Words</h3>

            {words.map((w: any, i: number) => (

                <div key={i}>

                    <input
                        placeholder="word"
                        value={w.word}
                        onChange={(e) => updateWord(i, "word", e.target.value)}
                    />

                    <input
                        placeholder="hint"
                        value={w.hint}
                        onChange={(e) => updateWord(i, "hint", e.target.value)}
                    />

                    <button onClick={() => remove(i)}>delete</button>

                </div>

            ))}

            <button onClick={addWord}>Add word</button>

        </div>

    )
}