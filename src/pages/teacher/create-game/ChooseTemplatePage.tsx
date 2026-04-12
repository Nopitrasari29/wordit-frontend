import { useSearchParams } from "react-router-dom"
import { templates } from "../../../data/templates"
import TemplateCard from "../../../components/game/TemplateCard"
import GameCreatorWizard from "../../../components/game/GameCreatorWizard"

export default function ChooseTemplatePage() {

    const [params] = useSearchParams()
    const level = params.get("level")

    const filtered =
        templates.filter(t => t.levels.includes(level || ""))

    return (

        <div className="space-y-6">

            <GameCreatorWizard step={1} />

            <h1 className="text-3xl font-bold">
                Choose Template
            </h1>

            <div className="grid md:grid-cols-3 gap-6">

                {filtered.map(template => (

                    <TemplateCard
                        key={template.id}
                        template={template}
                    />

                ))}

            </div>

        </div>

    )

}