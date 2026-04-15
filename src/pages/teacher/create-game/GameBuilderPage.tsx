import { useParams } from "react-router-dom"
import GameBuilderRouter from "../../../components/game/GameBuilderRouter"

export default function GameBuilderPage() {

  const { template } = useParams()

  return (

    <div className="max-w-6xl mx-auto py-10">

      <h1 className="text-3xl font-bold mb-8">
        Game Builder
      </h1>

      <GameBuilderRouter template={template} />

    </div>

  )

}