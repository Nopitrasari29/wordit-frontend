import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  Legend
} from "recharts"

/**
 * Komponen ini menerima data analytics dari backend yang mencakup
 * distribusi kelas dan statistik template kuis.
 */
export default function AnalyticsClassPage({ data }: { data: any }) {
  // 🛠️ SINKRONISASI DATA: Ambil distribusi kelas dari hasil Backend (BE-16)
  // Backend mengirimkan: classDistribution: [{ groupName: "3A", averageScore: 85, studentCount: 10 }]
  const classData = data?.classDistribution || [];

  // Ambil data summary untuk info tambahan
  const summary = data?.summary || { totalParticipants: 0, averageAccuracy: 0 };

  // Warna-warna ceria untuk Bar Chart agar sesuai dengan tema WordIT
  const COLORS = ['#4f46e5', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  return (
    <div className="space-y-8 font-sans">

      {/* ================= SUMMARY CARDS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-indigo-600 p-6 rounded-[2rem] text-white shadow-lg shadow-indigo-100 flex items-center justify-between">
          <div>
            <p className="text-indigo-100 font-bold text-xs uppercase tracking-widest mb-1">Total Peserta</p>
            <h2 className="text-4xl font-black">{summary.totalParticipants}</h2>
          </div>
          <div className="text-4xl opacity-50">👥</div>
        </div>
        <div className="bg-emerald-500 p-6 rounded-[2rem] text-white shadow-lg shadow-emerald-100 flex items-center justify-between">
          <div>
            <p className="text-emerald-50 font-bold text-xs uppercase tracking-widest mb-1">Rata-Rata Akurasi</p>
            <h2 className="text-4xl font-black">{summary.averageAccuracy}%</h2>
          </div>
          <div className="text-4xl opacity-50">🎯</div>
        </div>
      </div>

      {/* ================= SCORE DISTRIBUTION CHART ================= */}
      <div className="bg-white p-6 md:p-10 rounded-[3rem] shadow-sm border border-slate-100">

        {/* Header Analitik */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl">
              📈
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                Performa Kelompok
              </h2>
              <p className="text-sm font-bold text-slate-500">
                Rata-rata nilai berdasarkan awalan nama (Auto-Grouping)
              </p>
            </div>
          </div>

          <div className="bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Total Kelompok: {classData.length}
            </span>
          </div>
        </div>

        {/* Chart Container */}
        <div className="h-80 w-full">
          {classData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={classData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

                <XAxis
                  dataKey="groupName"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontWeight: 800, fontSize: 12 }}
                  dy={10}
                />

                <YAxis
                  domain={[0, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontWeight: 800, fontSize: 12 }}
                />

                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{
                    borderRadius: '1.5rem',
                    border: 'none',
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    fontWeight: 'bold',
                    padding: '1rem'
                  }}
                  itemStyle={{ color: '#4f46e5' }}
                />

                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: '20px', fontSize: '12px', fontWeight: 'bold' }}
                />

                <Bar
                  name="Rata-Rata Skor"
                  dataKey="averageScore"
                  radius={[12, 12, 0, 0]}
                  barSize={50}
                >
                  {classData.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50">
              <span className="text-4xl mb-3">🔍</span>
              <p className="text-slate-400 font-bold">Belum ada data kelompok terdeteksi.</p>
              <p className="text-[10px] text-slate-300 uppercase tracking-widest mt-1">Gunakan format "Kelas_Nama" pada nama pemain</p>
            </div>
          )}
        </div>
      </div>

      {/* ================= TOP 5 DIFFICULT QUESTIONS ================= */}
      {data?.difficultQuestions?.length > 0 && (
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-6 flex items-center gap-2">
            <span className="text-rose-500">⚠️</span> Soal Paling Sulit (Top 5)
          </h3>
          <div className="space-y-3">
            {data.difficultQuestions.map((q: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-4 bg-rose-50 rounded-2xl border border-rose-100">
                <span className="font-bold text-slate-700">Pertanyaan #{q.questionIndex + 1}</span>
                <span className="bg-rose-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">
                  {q.mistakeCount} Siswa Salah
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}