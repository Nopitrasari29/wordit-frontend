import { useState } from "react"

export default function WordSearchBuilder({ value, onChange }: any) {

    const [words, setWords] = useState(value?.data?.words || [])
    const [grid, setGrid] = useState(value?.data?.gridSize || 10)

    function update(newWords: any) {

        setWords(newWords)

        onChange({

            data: {

                gridSize: grid,
                words: newWords

            }

        })

    }

    return (

        <div>

            <h3>Word Search</h3>

            <input
                type="number"
                value={grid}
                onChange={(e) => setGrid(Number(e.target.value))}
            />

            {words.map((w: any, i: number) => (

                <input
                    key={i}
                    value={w}
                    onChange={(e) => {

                        const copy = [...words]
                        copy[i] = e.target.value
                        update(copy)

                    }}
                />

            ))}

            <button onClick={() => update([...words, ""])}>Add word</button>

        </div>

    )

}