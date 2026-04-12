import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer
} from "recharts"

type Props = {
    data: {
        game: string
        score: number
    }[]
}

export default function ScoreChart({ data }: Props) {

    return (

        <div className="bg-white p-6 rounded-xl shadow">

            <h3 className="text-lg font-semibold mb-4">
                Score Progress
            </h3>

            <ResponsiveContainer width="100%" height={300}>

                <LineChart data={data}>

                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="game" />

                    <YAxis />

                    <Tooltip />

                    <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#2563eb"
                        strokeWidth={3}
                    />

                </LineChart>

            </ResponsiveContainer>

        </div>

    )

}