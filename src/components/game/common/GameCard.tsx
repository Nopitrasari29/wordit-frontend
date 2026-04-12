import { useNavigate } from "react-router-dom"
import EducationBadge from "../../ui/EducationBadge"

type Props = {
    id: string
    title: string
    template: string
    level: string
}

export default function GameCard({ id, title, template, level }: Props) {

    const navigate = useNavigate()

    const handlePlay = () => {
        navigate(`/play/${id}`)
    }

    return (

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">

            <div className="flex justify-between items-start mb-2">

                <h3 className="font-semibold text-lg">
                    {title}
                </h3>

                <EducationBadge level={level} />

            </div>

            <p className="text-gray-500 mb-4">
                Template: {template}
            </p>

            <button
                onClick={handlePlay}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >

                Play

            </button>

        </div>

    )

}