import { createContext, useEffect } from "react"

import socket from "../hooks/useSocket"

export const SocketContext = createContext(socket)

export function SocketProvider({ children }: any) {

    useEffect(() => {

        socket.on("connect", () => {

            console.log("socket connected")

        })

        socket.on("disconnect", () => {

            console.log("socket disconnected")

        })

        return () => {

            socket.off("connect")
            socket.off("disconnect")

        }

    }, [])

    return (

        <SocketContext.Provider value={socket}>

            {children}

        </SocketContext.Provider>

    )

}