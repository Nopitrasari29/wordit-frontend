import { templates } from "../data/templates"

export const getTemplatesByLevel = (level: string) => {

    return templates.filter(
        template => template.levels.includes(level as any)
    )

}