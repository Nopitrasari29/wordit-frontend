import ScoreChart from "../../../components/analytics/ScoreChart"

export default function AnalyticsClassPage() {

    const stats = [
        { label: "Games Created", value: 12 },
        { label: "Games Played", value: 34 },
        { label: "Average Score", value: "82%" }
    ]

    const chartData = [
        { game: "Quiz 1", score: 75 },
        { game: "Quiz 2", score: 82 },
        { game: "Quiz 3", score: 88 }
    ]

    return (

        <div className="space-y-8">

            <h1 className="text-3xl font-bold">
                Class Analytics
            </h1>

            <div className="grid md:grid-cols-3 gap-6">

                {stats.map((s, i) => (

                    <div key={i} className="bg-white p-6 rounded-xl shadow">

                        <p className="text-gray-500">
                            {s.label}
                        </p>

                        <h2 className="text-2xl font-bold">
                            {s.value}
                        </h2>

                    </div>

                ))}

            </div>

            <ScoreChart data={chartData} />

        </div>

    )

}