import { dummyAdminStats } from "../../data/dummyAdminStats"

export default function AdminDashboard() {

  const stats = dummyAdminStats

  return (

    <div className="space-y-10">

      <h1 className="text-3xl font-bold">
        Admin Dashboard
      </h1>

      {/* SYSTEM STATS */}

      <div className="grid grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded shadow">

          <p className="text-gray-500 text-sm">
            Total Users
          </p>

          <h2 className="text-2xl font-bold">
            {stats.totalUsers}
          </h2>

        </div>

        <div className="bg-white p-6 rounded shadow">

          <p className="text-gray-500 text-sm">
            Total Games
          </p>

          <h2 className="text-2xl font-bold">
            {stats.totalGames}
          </h2>

        </div>

        <div className="bg-white p-6 rounded shadow">

          <p className="text-gray-500 text-sm">
            Total Sessions
          </p>

          <h2 className="text-2xl font-bold">
            {stats.totalSessions}
          </h2>

        </div>

      </div>

      {/* SYSTEM LOGS */}

      <div>

        <h2 className="text-xl font-semibold mb-4">
          System Logs
        </h2>

        <div className="bg-white rounded shadow">

          {stats.systemLogs.map(log => (

            <div
              key={log.id}
              className="border-b p-4 text-sm"
            >

              <p>{log.message}</p>

              <span className="text-gray-400 text-xs">
                {log.date}
              </span>

            </div>

          ))}

        </div>

      </div>

    </div>

  )

}