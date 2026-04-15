export default function SystemLogsPage() {

  const logs = [
    { id: 1, event: "User Login", user: "student1" },
    { id: 2, event: "Game Created", user: "teacher1" },
  ]

  return (

    <div className="max-w-5xl mx-auto py-10">

      <h1 className="text-3xl font-bold mb-8">
        System Logs
      </h1>

      <table className="w-full border">

        <thead>

          <tr className="bg-gray-100">

            <th className="p-3">Event</th>
            <th className="p-3">User</th>

          </tr>

        </thead>

        <tbody>

          {logs.map(log => (

            <tr key={log.id}>

              <td className="p-3">{log.event}</td>
              <td className="p-3">{log.user}</td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  )

}