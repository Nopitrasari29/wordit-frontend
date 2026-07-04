import { io } from "socket.io-client"

const socket = io((import.meta as unknown as { env: { VITE_API_URL?: string } }).env.VITE_API_URL || "https://wordit.it-its.id")

export default socket