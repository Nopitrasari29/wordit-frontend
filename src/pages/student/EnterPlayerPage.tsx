import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

export default function EnterPlayerPage() {
    const [name, setName] = useState("")
    const [params] = useSearchParams(); const navigate = useNavigate()
    const code = params.get("code") || ""

    function handleEnter(e: React.FormEvent) {
        e.preventDefault()
        if (!name.trim()) return
        sessionStorage.setItem("playerName", name.trim())
        sessionStorage.setItem("gameCode", code)
        navigate(`/game/lobby?code=${code}&player=${encodeURIComponent(name.trim())}`)
    }
    return (
        <div className="flex justify-center mt-20">
            <form onSubmit={handleEnter} className="bg-white p-8 rounded-xl shadow w-[400px]">
                <h1 className="text-xl font-bold mb-2">Masukkan Nama Kamu</h1>
                <p className="text-gray-400 text-sm mb-4">Share Code: <span className="font-mono font-bold text-indigo-600">{code}</span></p>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Nama pemain" className="border w-full p-3 rounded mb-4" required />
                <button type="submit" className="bg-indigo-600 text-white w-full py-2 rounded">Masuk Game</button>
            </form>
        </div>
    )
}
