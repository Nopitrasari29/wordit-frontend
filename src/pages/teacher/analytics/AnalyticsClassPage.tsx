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
      template: template.replace(/_/g, " "), // Sedikit UI tweak agar teksnya rapi (tanpa underscore)
      plays
    })
  )

  return (
    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 font-sans">

      {/* Header Analitik */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl">
          📈
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            Class Analytics
          </h2>
          <p className="text-sm font-bold text-slate-500">
            Game Plays by Template
          </p>
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-72 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>

            {/* Grid lebih halus dan tidak terlihat kaku */}
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

            <XAxis
              dataKey="template"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontWeight: 800, fontSize: 12 }}
              dy={10}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontWeight: 800, fontSize: 12 }}
            />

            {/* Tooltip melengkung */}
            <Tooltip
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
            />

            {/* Bar melengkung (bubbly) */}
            <Bar dataKey="plays" fill="#4f46e5" radius={[8, 8, 0, 0]} barSize={40} />

          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  )
}