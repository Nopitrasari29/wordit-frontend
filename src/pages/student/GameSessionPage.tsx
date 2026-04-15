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

    return <p>Loading...</p>

  }

  return (

    <div>

      <h2>Game Session</h2>

      <GameRenderer game={game} />

    </div>

  )

}