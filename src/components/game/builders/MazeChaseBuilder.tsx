import { useState } from "react"

export default function MazeChaseBuilder({ value, onChange }: any) {

    const [mazeSize, setMazeSize] = useState(value?.data?.mazeSize || 10)
    const [words, setWords] = useState(value?.data?.words || [])

    function update(newWords: any, size = mazeSize) {

        setWords(newWords)

        onChange({
            data: {
                mazeSize: size,
                words: newWords
            }
        })
    }

    function addWord() {
        update([...words, ""])
    }

    function change(index: number, val: string) {

        const copy = [...words]
        copy[index] = val

        update(copy)
    }

    return (

        <div>

            <h3>Maze Chase</h3>

            <label>Maze Size</label>

            <input
                type="number"
                value={mazeSize}
                onChange={(e) => {
                    const size = Number(e.target.value)
                    setMazeSize(size)
                    update(words, size)
                }}
            />

            {words.map((w: any, i: number) => (

                <input
                    key={i}
                    value={w}
                    onChange={(e) => change(i, e.target.value)}
                />

            ))}

            <button onClick={addWord}>Add word</button>

        </div>

    )
}