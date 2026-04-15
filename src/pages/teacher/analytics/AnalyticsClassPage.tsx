import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts"

export default function AnalyticsClassPage({ games }: any) {

  const templateStats: Record<string, number> = {}

  games.forEach((g: any) => {

    if (!templateStats[g.templateType]) {
      templateStats[g.templateType] = 0
    }

    templateStats[g.templateType] += g.playCount || 0

  })

  const chartData = Object.entries(templateStats).map(
    ([template, plays]) => ({
      template,
      plays
    })
  )

  return (

    <div className="bg-white p-6 rounded shadow">

      <h2 className="text-xl font-semibold mb-4">
        Class Analytics
      </h2>

      <p className="text-sm text-gray-500 mb-6">
        Game Plays by Template
      </p>

      <div className="h-64">

        <ResponsiveContainer width="100%" height="100%">

          <BarChart data={chartData}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="template" />

            <YAxis />

            <Tooltip />

            <Bar dataKey="plays" fill="#6366f1" />

          </BarChart>

        </ResponsiveContainer>

      </div>

    </div>

  )

}