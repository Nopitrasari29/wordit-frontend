import { useSearchParams } from "react-router-dom"
import GameTemplateController from "../../components/game/GameTemplateController"

export default function PlayGamePage() {

    const [params] = useSearchParams()
    const template = params.get("template")

    return (

        <div>

            <GameTemplateController template={template || ""} />

        </div>

    )

}