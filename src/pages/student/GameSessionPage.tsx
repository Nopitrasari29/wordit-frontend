import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import socket from "../../hooks/useSocket"
import { getGame } from "../services/game.service"
import GameRenderer from "../../components/game/GameRenderer"

export default function GameSessionPage() {
  const { sessionId } = useParams()
  const [game, setGame] = useState<any>(null)

  useEffect(() => {
    async function load() {
      if (!sessionId) return
      const data = await getGame(sessionId)
      setGame(data)
    }
    load()
    socket.emit("joinGame", sessionId)
  }, [sessionId])

  if (!game) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-16 h-16 border-8 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="mt-4 font-black text-indigo-600 animate-pulse">Menyiapkan Sesi Game...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-2xl">🎮</div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Game Session</h2>
        </div>
        <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden border-[8px] border-white">
          <GameRenderer game={game} />
        </div>
      </div>
    </div>
  )
}