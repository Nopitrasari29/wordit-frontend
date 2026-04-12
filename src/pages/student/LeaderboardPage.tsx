import LeaderboardTable from "../../components/game/common/LeaderboardTable"

export default function LeaderboardPage() {

    const players = [
        { name: "Rafika", score: 90 },
        { name: "Budi", score: 80 },
        { name: "Siti", score: 70 }
    ]

    return (

        <div className="space-y-6">

            <h1 className="text-3xl font-bold">
                Leaderboard
            </h1>

            <LeaderboardTable players={players} />

        </div>

    )

}