import { useNavigate } from "react-router-dom"

export default function GameLobbyPage() {

    const navigate = useNavigate()

    return (

        <div className="space-y-6">

            <h1 className="text-3xl font-bold">
                Game Lobby
            </h1>

            <p className="text-gray-500">
                Waiting for game to start...
            </p>

            <button
                onClick={() => navigate("/game/play")}
                className="bg-green-600 text-white px-6 py-2 rounded"
            >
                Start Game
            </button>

        </div>

    )

}