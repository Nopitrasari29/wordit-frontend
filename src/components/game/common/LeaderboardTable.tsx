export default function LeaderboardTable({ leaderboard }: any) {

  if (!leaderboard || leaderboard.length === 0) {

    return (
      <p className="text-gray-400 text-sm">
        No leaderboard data yet
      </p>
    )

  }

  return (

    <table className="w-full text-sm">

      <thead>

        <tr className="text-left border-b">

          <th className="py-2">Rank</th>
          <th>Name</th>
          <th>Score</th>

        </tr>

      </thead>

      <tbody>

        {leaderboard.map((p: any, i: number) => (

          <tr key={i} className="border-b">

            <td className="py-2">{i + 1}</td>
            <td>{p.name}</td>
            <td>{p.score}</td>

          </tr>

        ))}

      </tbody>

    </table>

  )

}