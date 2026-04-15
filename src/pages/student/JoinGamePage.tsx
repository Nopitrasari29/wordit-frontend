import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function JoinGamePage() {
  const [code, setCode] = useState("")
  const navigate = useNavigate()

  function handleJoin() {
    if (!code) return
    navigate(`/play/${code}`)
  }

  return (
    <div className="min-h-screen bg-indigo-600 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-indigo-900 selection:text-white">

      {/* Pattern/Shape Background Ceria */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl float"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/30 rounded-full blur-3xl float" style={{ animationDelay: '1s' }}></div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-lg text-center">

        <h1 className="text-5xl md:text-7xl font-black text-white mb-10 tracking-tight drop-shadow-sm">
          Word<span className="text-blue-300">IT</span>
        </h1>

        <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl float" style={{ animationDuration: '4s' }}>
          <h2 className="text-2xl font-black text-slate-800 mb-8">Siap Bermain?</h2>

          <input
            placeholder="KODE GAME"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full bg-slate-100 text-center text-4xl md:text-5xl font-black text-slate-800 py-6 rounded-3xl border-4 border-slate-200 focus:border-indigo-500 focus:bg-white focus:outline-none uppercase tracking-widest mb-6 transition-all"
          />

          <button
            onClick={handleJoin}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-2xl font-black py-6 rounded-3xl shadow-[0_10px_0_rgb(67,56,202)] hover:translate-y-2 hover:shadow-[0_2px_0_rgb(67,56,202)] transition-all active:translate-y-3 active:shadow-none"
          >
            MASUK!
          </button>
        </div>

      </div>
    </div>
  )
}