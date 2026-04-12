export default function SystemLogsPage() {

    const logs = [
        {
            event: "User Login",
            user: "teacher@mail.com",
            time: "10:32 AM"
        },
        {
            event: "Game Created",
            user: "teacher@mail.com",
            time: "10:35 AM"
        }
    ]

    return (

        <div>

            <h1 className="text-3xl font-bold mb-6">
                System Logs
            </h1>

            <table className="w-full bg-white rounded-xl shadow">

                <thead className="bg-gray-100">

                    <tr>

                        <th className="p-3 text-left">
                            Event
                        </th>

                        <th className="p-3 text-left">
                            User
                        </th>

                        <th className="p-3 text-left">
                            Time
                        </th>

                    </tr>

                </thead>

                <tbody>

                    {logs.map((log, i) => (

                        <tr key={i} className="border-t">

                            <td className="p-3">
                                {log.event}
                            </td>

                            <td className="p-3">
                                {log.user}
                            </td>

                            <td className="p-3">
                                {log.time}
                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>

    )

}