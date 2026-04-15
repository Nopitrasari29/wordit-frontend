export default function SystemLogsPage() {
  const logs = [
    { id: 1, event: "User Login", user: "student1" },
    { id: 2, event: "Game Created", user: "teacher1" },
  ]

  return (
    <div className="max-w-5xl mx-auto py-10 px-6 font-sans">
      <h1 className="text-3xl font-black text-slate-800 mb-8 tracking-tight">System Logs 🛡️</h1>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="p-5 font-black text-slate-400 uppercase text-xs tracking-widest">Event</th>
                <th className="p-5 font-black text-slate-400 uppercase text-xs tracking-widest">User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-5">
                    <span className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-sm font-bold">
                      {log.event}
                    </span>
                  </td>
                  <td className="p-5 font-bold text-slate-600">{log.user}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}