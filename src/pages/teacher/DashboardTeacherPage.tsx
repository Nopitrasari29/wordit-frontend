import PageWrapper from "../../components/ui/PageWrapper"

export default function DashboardTeacherPage() {

    const stats = [

        {
            label: "Games Created",
            value: 12,
            color: "border-indigo-500"
        },

        {
            label: "Games Played",
            value: 34,
            color: "border-green-500"
        },

        {
            label: "Average Score",
            value: "82%",
            color: "border-orange-500"
        }

    ]

    return (

        <PageWrapper title="Teacher Dashboard" color="#6366F1">

            <div className="grid md:grid-cols-3 gap-6">

                {stats.map((s, i) => (

                    <div
                        key={i}
                        className={`bg-white shadow-xl rounded-xl p-6 border-t-4 ${s.color}`}
                    >

                        <p className="text-gray-500">
                            {s.label}
                        </p>

                        <h2 className="text-3xl font-bold">
                            {s.value}
                        </h2>

                    </div>

                ))}

            </div>

            {/* Recent Activity */}

            <div className="mt-10 bg-white p-6 rounded-xl shadow">

                <h2 className="text-xl font-bold mb-4">
                    Recent Activity
                </h2>

                <ul className="space-y-2 text-gray-600">

                    <li>• Created "Math Quiz"</li>
                    <li>• Published "History Matching"</li>
                    <li>• Class A played "Science True/False"</li>

                </ul>

            </div>

        </PageWrapper>

    )

}