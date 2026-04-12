import ScoreChart from "../../components/analytics/ScoreChart"
import ResultTable from "../../components/analytics/ResultTable"

export default function AnalyticsStudentPage() {

    const chartData = [
        { game: "Quiz 1", score: 70 },
        { game: "Quiz 2", score: 85 },
        { game: "Quiz 3", score: 90 }
    ]

    const results = [
        { player: "Fika", game: "Quiz 1", score: 70, accuracy: 75 },
        { player: "Fika", game: "Quiz 2", score: 85, accuracy: 90 }
    ]

    return (

        <div className="space-y-8">

            <h1 className="text-3xl font-bold">
                My Analytics
            </h1>

            <ScoreChart data={chartData} />

            <ResultTable results={results} />

        </div>

    )

}