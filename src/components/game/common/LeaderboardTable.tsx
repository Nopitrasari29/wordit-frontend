interface Player {
    name: string
    score: number
}

type Props = {
    players: Player[]
}

export default function LeaderboardTable({ players }: Props) {

    return (

        <div className="bg-white p-6 rounded-xl shadow">

            <h3 className="text-lg font-semibold mb-4">
                Leaderboard
            </h3>

            <table className="w-full border">

                <thead className="bg-gray-100">

                    <tr>

                        <th className="p-2 border text-center">
                            Rank
                        </th>

                        <th className="p-2 border text-left">
                            Player
                        </th>

                        <th className="p-2 border text-center">
                            Score
                        </th>

                    </tr>

                </thead>

                <tbody>

                    {players.map((p, i) => (

                        <tr
                            key={i}
                            className={i === 0 ? "bg-yellow-50 font-semibold" : ""}
                        >

                            <td className="p-2 border text-center">
                                {i + 1}
                            </td>

                            <td className="p-2 border">
                                {p.name}
                            </td>

                            <td className="p-2 border text-center">
                                {p.score}
                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>

    )

}