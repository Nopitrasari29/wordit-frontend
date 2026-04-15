import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import GameRenderer from "../../components/game/GameRenderer"

interface Game {
  id: string
  title: string
  templateType: string
  gameJson: any
}

export default function PlayGamePage() {
  const { gameId } = useParams()
  const [game, setGame] = useState<Game | null>(null)

  useEffect(() => {
    fetch(`http://localhost:3000/api/games/${gameId}`)
      .then(res => res.json())
      .then(data => setGame(data))
      .catch(() => {
        // fallback demo
        setGame({
          id: "demo",
          title: "Animal Anagram",
          templateType: "ANAGRAM",
          gameJson: {}
        })
      })
  }, [gameId])

  if (!game) return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center font-sans">
      <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
      <p className="text-xl font-black text-slate-500 animate-pulse">Menyiapkan Arena Bermain...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-transparent">

      {/* TOP BAR: Info Game */}
      <div className="bg-white px-6 py-4 flex justify-between items-center shadow-sm z-10 shrink-0 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-black">
            🎮
          </div>
          <h1 className="font-black text-slate-800 text-lg md:text-xl truncate max-w-[200px] md:max-w-md">
            {game.title}
          </h1>
        </div>

        {/* Badge Tipe Game */}
        <div className="hidden md:flex font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100 text-sm">
          {game.templateType.replace("_", " ")}
        </div>
      </div>

      {/* MAIN GAME AREA (Tempat GameRenderer berada) */}
      <div className="flex-1 flex flex-col p-4 md:p-8 w-full">

        {/* Wrapper melengkung untuk game engine kamu */}
        <div className="bg-white flex-1 rounded-[3rem] shadow-xl border-[6px] border-indigo-50 overflow-hidden relative">

          <GameRenderer
            templateType={game.templateType}
            gameData={game.gameJson}
          />

        </div>

      </div>
    </div>
  )
}