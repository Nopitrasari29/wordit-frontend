export default function AdminDashboardPage() {

    const stats = [
        { title: "Total Users", value: 120 },
        { title: "Active Games", value: 32 },
        { title: "Games Played Today", value: 540 }
    ]

    return (

        <div className="space-y-8">

            <h1 className="text-3xl font-bold">
                Admin Dashboard
            </h1>

            <div className="grid md:grid-cols-3 gap-6">

                {stats.map((s, i) => (

                    <div
                        key={i}
                        className="bg-white p-6 rounded-xl shadow"
                    >

                        <h3 className="text-gray-500 text-sm mb-2">
                            {s.title}
                        </h3>

                        <p className="text-2xl font-bold">
                            {s.value}
                        </p>

                    </div>

                ))}

            </div>

        </div>

    )

}