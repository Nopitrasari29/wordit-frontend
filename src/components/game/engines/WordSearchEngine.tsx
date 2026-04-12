import { useState } from "react"

export default function WordSearchEngine({ words }: any) {

    const size = 10

    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

    function generate() {

        const grid: string[][] = []

        for (let i = 0; i < size; i++) {

            const row: string[] = []

            for (let j = 0; j < size; j++) {

                row.push(
                    letters[Math.floor(Math.random() * letters.length)]
                )

            }

            grid.push(row)

        }

        return grid

    }

    const [grid] = useState(generate())

    return (

        <div className="text-center">

            <h2 className="text-xl mb-4">
                Word Search
            </h2>

            <div className="grid grid-cols-10 gap-1">

                {grid.map((r, i) =>
                    r.map((c, j) => (
                        <div
                            key={`${i}-${j}`}
                            className="w-8 h-8 border flex items-center justify-center"
                        >
                            {c}
                        </div>
                    ))
                )}

            </div>

            <ul className="mt-6">

                {words.map((w: string, i: number) => (
                    <li key={i}>{w}</li>
                ))}

            </ul>

        </div>

    )

}