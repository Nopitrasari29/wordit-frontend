import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function EnterPlayerPage() {

    const [name, setName] = useState("")
    const navigate = useNavigate()

    function handleEnter(e: React.FormEvent) {
        e.preventDefault()
        navigate("/game/lobby")
    }

    return (

        <div className="flex justify-center mt-20">

            <form
                onSubmit={handleEnter}
                className="bg-white p-8 rounded-xl shadow w-[400px]"
            >

                <h1 className="text-xl font-bold mb-4">
                    Enter Your Name
                </h1>

                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Player name"
                    className="border w-full p-3 rounded mb-4"
                />

                <button className="bg-indigo-600 text-white w-full py-2 rounded">
                    Enter Game
                </button>

            </form>

        </div>

    )

}