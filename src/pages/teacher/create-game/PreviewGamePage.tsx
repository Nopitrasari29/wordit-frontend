import { useSearchParams } from "react-router-dom"
import GameRenderer from "../../../components/game/GameRenderer"

export default function PreviewGamePage() {

  const [params] = useSearchParams()

  const template = params.get("template")

  const mockGame = {
    templateType: template || "ANAGRAM",
    data: {},
  }

  return (

    <div className="max-w-6xl mx-auto px-6 py-10">

      <h1 className="text-2xl font-bold mb-6">
        Game Preview
      </h1>

      <GameRenderer
        templateType={mockGame.templateType}
        gameData={mockGame.data}
      />

    </div>

  )

}