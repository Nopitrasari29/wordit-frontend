import { dummyAdminStats } from "../../data/dummyAdminStats"

export default function AdminDashboard() {
  const stats = dummyAdminStats

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12 p-4 md:p-8 space-y-10">

      {/* ================= HEADER BANNER ================= */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500 opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute top-0 left-1/4 w-40 h-40 bg-blue-500 opacity-10 rounded-full blur-2xl"></div>

        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-black mb-2 tracking-tight">
            Admin Dashboard 🛡️
          </h1>
          <p className="text-slate-400 font-semibold text-lg">
            Pantau ringkasan sistem dan aktivitas platform WordIT.
          </p>
        </div>
      </div>

      {/* ================= SYSTEM STATS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5 hover:-translate-y-1 transition-transform">
          <div className="w-16 h-16 shrink-0 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl">👨‍👩‍👧‍👦</div>
          <div>
            <p className="text-slate-500 font-bold text-sm mb-1">Total Users</p>
            <h2 className="text-3xl font-black text-slate-800">{stats.totalUsers}</h2>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5 hover:-translate-y-1 transition-transform">
          <div className="w-16 h-16 shrink-0 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl">🎮</div>
          <div>
            <p className="text-slate-500 font-bold text-sm mb-1">Total Games</p>
            <h2 className="text-3xl font-black text-slate-800">{stats.totalGames}</h2>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5 hover:-translate-y-1 transition-transform">
          <div className="w-16 h-16 shrink-0 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-3xl">⚡</div>
          <div>
            <p className="text-slate-500 font-bold text-sm mb-1">Total Sessions</p>
            <h2 className="text-3xl font-black text-slate-800">{stats.totalSessions}</h2>
          </div>
        </div>

      </div>

      {/* ================= SYSTEM LOGS ================= */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 mb-6 px-2">
          System Logs
        </h2>

        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 overflow-hidden">
          {stats.systemLogs.map((log, index) => (
            <div
              key={log.id}
              className={`flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 hover:bg-slate-50 transition-colors rounded-2xl ${index !== stats.systemLogs.length - 1 ? "border-b border-slate-50" : ""
                }`}
            >
              <div className="flex items-center gap-4 mb-2 sm:mb-0">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 text-sm font-black">
                  📝
                </div>
                <p className="font-bold text-slate-700 text-sm md:text-base">{log.message}</p>
              </div>

              <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ml-14 sm:ml-0">
                {log.date}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}