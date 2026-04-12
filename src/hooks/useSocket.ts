import { useEffect } from "react"
import socket from "../services/socket"

export function useSocket(gameCode: string, playerName: string) {

    useEffect(() => {

        socket.connect()

        socket.emit("join_game", {
            gameCode,
            playerName
        })

        return () => {

            socket.emit("leave_game", {
                gameCode,
                playerName
            })

            socket.disconnect()

        }

    }, [gameCode, playerName])

}