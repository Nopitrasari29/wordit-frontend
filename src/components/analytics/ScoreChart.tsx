export default function ScoreChart({ data }: Props) {
    return (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 font-sans">
            <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-2">
                📈 Progress Skor Kamu
            </h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="game" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 700, fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 700, fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={6} dot={{ r: 8, fill: '#4f46e5', strokeWidth: 4, stroke: '#fff' }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}