import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid
} from "recharts"

export default function ScoreChart({ data }: { data: any[] }) {
    return (
        <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>

                    {/* Grid halus sesuai gaya Bubbly */}
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

                    <XAxis
                        dataKey="game"
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

                    <Tooltip
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{
                            borderRadius: '1rem',
                            border: 'none',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            fontWeight: 'bold',
                            fontFamily: 'sans-serif'
                        }}
                    />

                    {/* Bar melengkung warna Indigo untuk Student */}
                    <Bar
                        dataKey="score"
                        fill="#4f46e5"
                        radius={[10, 10, 0, 0]}
                        barSize={45}
                    />

                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}