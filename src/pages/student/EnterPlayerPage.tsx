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
        <div className="min-h-screen bg-indigo-600 flex flex-col items-center justify-center p-6 font-sans overflow-hidden relative">
            <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl -top-20 -left-20 animate-pulse"></div>

            <form onSubmit={handleEnter} className="bg-white p-10 md:p-14 rounded-[3rem] shadow-2xl w-full max-w-md relative z-10 text-center">
                <h1 className="text-3xl font-black text-slate-800 mb-2">Siapa Namamu?</h1>
                <p className="text-slate-400 font-bold mb-8">Share Code: <span className="font-mono text-indigo-600 tracking-wider">{code}</span></p>

                <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ketik namamu di sini..."
                    className="w-full bg-slate-50 border-4 border-slate-100 focus:border-indigo-500 focus:bg-white p-5 rounded-3xl text-center text-xl font-bold outline-none transition-all mb-6"
                    required
                />

                <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white w-full py-5 rounded-3xl font-black text-xl shadow-[0_10px_0_rgb(67,56,202)] hover:translate-y-1 hover:shadow-[0_6px_0_rgb(67,56,202)] active:translate-y-2 active:shadow-none transition-all uppercase tracking-widest">
                    Gas Main! 🚀
                </button>
            </form>
        </div>
    )
}