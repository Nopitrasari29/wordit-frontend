import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function JoinGamePage() {

    const [code, setCode] = useState("")
    const navigate = useNavigate()

    function handleJoin(e: React.FormEvent) {
        e.preventDefault()
        navigate(`/game/player?code=${code}`)
    }

    return (

        <div className="flex justify-center mt-20">

            <form
                onSubmit={handleJoin}
                className="bg-white p-8 rounded-xl shadow w-[400px]"
            >

                <h1 className="text-2xl font-bold mb-4">
                    Join Game
                </h1>

                <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter game code"
                    className="border w-full p-3 rounded mb-4"
                />

                <button
                    className="bg-indigo-600 text-white w-full py-2 rounded"
                >
                    Join
                </button>

            </form>

        </div>

    )

}