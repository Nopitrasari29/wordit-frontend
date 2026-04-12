type Result = {
    player: string
    game: string
    score: number
    accuracy: number
}

type Props = {
    results: Result[]
}

export default function ResultTable({ results }: Props) {

    return (

        <div className="bg-white p-6 rounded-xl shadow">

            <h3 className="text-lg font-semibold mb-4">
                Game Results
            </h3>

            <table className="w-full text-left">

                <thead>

                    <tr className="border-b">

                        <th className="py-2">Player</th>
                        <th>Game</th>
                        <th>Score</th>
                        <th>Accuracy</th>

                    </tr>

                </thead>

                <tbody>

                    {results.map((r, i) => (

                        <tr key={i} className="border-b">

                            <td className="py-2">
                                {r.player}
                            </td>

                            <td>
                                {r.game}
                            </td>

                            <td>
                                {r.score}
                            </td>

                            <td>
                                {r.accuracy}%
                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>

    )

}