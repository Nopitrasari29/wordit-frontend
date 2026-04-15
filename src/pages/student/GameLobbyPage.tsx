import { useEffect, useState } from "react"

import socket from "../../hooks/useSocket"

export default function GameLobbyPage({ gameId }: any) {

    const [players, setPlayers] = useState<string[]>([])

    useEffect(() => {

        socket.emit("joinLobby", gameId)

        socket.on("players", (list: any) => {

            setPlayers(list)

        })

    }, [])

    return (

        <div>

            <h2>Game Lobby</h2>

            <p>Waiting for players...</p>

            <ul>

                {players.map((p, i) => (

                    <li key={i}>{p}</li>

                ))}

            </ul>

        </div>

    )

}