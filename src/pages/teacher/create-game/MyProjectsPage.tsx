import { Link } from "react-router-dom"

export default function MyProjectsPage() {

    const projects = [
        { id: "1", title: "Math Quiz", template: "Quiz" },
        { id: "2", title: "History Matching", template: "Matching Pair" },
        { id: "3", title: "English Flashcard", template: "Flashcard" }
    ]

    return (

        <div className="space-y-6">

            <h1 className="text-3xl font-bold">
                My Projects
            </h1>

            {projects.map(project => (

                <div key={project.id} className="bg-white p-4 rounded shadow">

                    <h2 className="font-semibold">
                        {project.title}
                    </h2>

                    <p className="text-gray-500">
                        Template: {project.template}
                    </p>

                    <div className="flex gap-4 mt-2">

                        <Link to="/game/edit" className="text-blue-600">
                            Edit
                        </Link>

                        <Link to="/game/preview" className="text-green-600">
                            Preview
                        </Link>

                    </div>

                </div>

            ))}

        </div>

    )

}