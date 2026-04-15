import { useParams } from "react-router-dom"
import GameBuilderRouter from "../../../components/game/GameBuilderRouter"

export default function GameBuilderPage() {
  const { template } = useParams()

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">

      {/* BUILDER HEADER */}
      <div className="bg-white border-b border-slate-200 px-6 py-8 mb-8 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl font-black">
            🛠️
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
              Game Builder
            </h1>
            <p className="text-slate-500 font-semibold text-sm">
              Template: <span className="text-indigo-600 font-bold capitalize">{template?.replaceAll("_", " ")}</span>
            </p>
          </div>
        </div>
      </div>

      {/* ROUTER CONTAINER */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-xl border border-slate-100">
          <GameBuilderRouter template={template} />
        </div>
      </div>

    </div>
  )
}