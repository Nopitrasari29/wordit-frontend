import { useNavigate } from "react-router-dom"
import { templateIcons } from "../../data/templateIcons"

type Template = {
    id: string
    name: string
    levels: string[]
}

type Props = {
    template: Template
}

export default function TemplateCard({ template }: Props) {

    const navigate = useNavigate()

    const handleClick = () => {

        navigate(`/game/create?template=${template.id}`)

    }

    return (

        <div
            onClick={handleClick}
            className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition cursor-pointer"
        >

            <div className="text-4xl mb-3">

                {templateIcons[template.id]}

            </div>

            <h3 className="font-semibold text-lg mb-2">

                {template.name}

            </h3>

            <div className="flex flex-wrap gap-2">

                {template.levels.map((level) => (

                    <span
                        key={level}
                        className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded"
                    >

                        {level}

                    </span>

                ))}

            </div>

        </div>

    )

}