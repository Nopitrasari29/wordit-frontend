export default function ClassPage() {

    const classes = [
        { name: "Class A", students: 20 },
        { name: "Class B", students: 18 },
        { name: "Class C", students: 22 }
    ]

    return (

        <div>

            <h1 className="text-3xl font-bold mb-6">
                Classes
            </h1>

            <div className="grid md:grid-cols-3 gap-6">

                {classes.map((c, i) => (

                    <div key={i} className="border p-6 rounded">

                        <h2 className="font-bold mb-2">
                            {c.name}
                        </h2>

                        <p className="text-gray-500">
                            Students: {c.students}
                        </p>

                        <button className="text-blue-600 mt-3">
                            View Class
                        </button>

                    </div>

                ))}

            </div>

        </div>

    )

}