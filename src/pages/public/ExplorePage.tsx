import { useState } from "react"
import { templates } from "../../data/templates"
import TemplateCard from "../../components/game/TemplateCard"

export default function ExplorePage() {

    const [levelFilter, setLevelFilter] = useState("ALL")

    const filteredTemplates =
        levelFilter === "ALL"
            ? templates
            : templates.filter(t => t.levels.includes(levelFilter))

    return (

        <div className="space-y-8">

            <h1 className="text-3xl font-bold">
                Explore Templates
            </h1>

            <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="border px-4 py-2 rounded-lg"
            >

                <option value="ALL">All Levels</option>
                <option value="SD">SD</option>
                <option value="SMP">SMP</option>
                <option value="SMA">SMA</option>
                <option value="UNIVERSITY">University</option>

            </select>

            <div className="grid md:grid-cols-3 gap-6">

                {filteredTemplates.map(template => (

                    <TemplateCard
                        key={template.id}
                        template={template}
                    />

                ))}

            </div>

        </div>

    )

}