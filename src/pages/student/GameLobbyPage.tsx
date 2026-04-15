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
        <div className="min-h-screen bg-indigo-900 flex flex-col relative overflow-hidden font-sans selection:bg-indigo-500 text-center">

            {/* Pattern Background Animasi */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent bg-[length:20px_20px]"></div>

            {/* Main Content (Center) */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">

                {/* Loading Icon Animasi */}
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-5xl mb-8 animate-bounce">
                    ⏳
                </div>

                <h2 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-md tracking-tight">
                    Game Lobby
                </h2>

                <p className="text-indigo-200 text-xl font-bold mb-10">
                    Waiting for the teacher to start...
                </p>

                {/* Counter Pemain */}
                <div className="bg-black/20 px-8 py-4 rounded-full mb-10 border border-white/10 shadow-inner">
                    <span className="text-2xl font-black text-white">{players.length} Players Joined</span>
                </div>

                {/* Player List (Bubbly Tags) */}
                <div className="flex flex-wrap justify-center gap-4 max-w-4xl">
                    {players.length === 0 ? (
                        <p className="text-white/50 font-bold">Belum ada yang bergabung...</p>
                    ) : (
                        players.map((p, i) => (
                            <div
                                key={i}
                                className="bg-white text-indigo-900 px-6 py-3 rounded-full text-xl font-black shadow-lg animate-fade-in-up"
                            >
                                {p}
                            </div>
                        ))
                    )}
                </div>

            </div>
        </div>
    )
}