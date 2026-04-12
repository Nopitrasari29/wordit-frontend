export default function UserManagementPage() {

    const users = [
        { email: "student@mail.com", role: "student" },
        { email: "teacher@mail.com", role: "teacher" }
    ]

    return (

        <div>

            <h1 className="text-3xl font-bold mb-6">
                User Management
            </h1>

            <table className="w-full bg-white rounded-xl shadow">

                <thead className="bg-gray-100">

                    <tr>

                        <th className="p-3 text-left">
                            Email
                        </th>

                        <th className="p-3 text-left">
                            Role
                        </th>

                        <th className="p-3 text-left">
                            Action
                        </th>

                    </tr>

                </thead>

                <tbody>

                    {users.map((u, i) => (

                        <tr key={i} className="border-t">

                            <td className="p-3">
                                {u.email}
                            </td>

                            <td className="p-3 capitalize">
                                {u.role}
                            </td>

                            <td className="p-3">

                                <button className="text-red-500">
                                    Remove
                                </button>

                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>

    )

}