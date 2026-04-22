import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"

export default function ResultPage() {
  const navigate = useNavigate()
  const location = useLocation()
  
  // 🎯 Mengambil data dari state navigasi (dikirim oleh PlayGamePage/Engine)
  // Fallback ke sessionStorage jika page di-refresh
  const [score, setScore] = useState(0)
  const [accuracy, setAccuracy] = useState(0)
  const [playerName, setPlayerName] = useState("Guest")

  useEffect(() => {
    // 1. Ambil Nama dari storage
    const savedName = sessionStorage.getItem("playerName") || "Player"
    setPlayerName(savedName)

    // 2. Ambil Skor & Akurasi dari state navigasi atau storage
    const finalScore = location.state?.score ?? parseInt(sessionStorage.getItem("lastScore") || "0")
    const finalAccuracy = location.state?.accuracy ?? parseInt(sessionStorage.getItem("lastAccuracy") || "0")
    
    setScore(finalScore)
    setAccuracy(finalAccuracy)
  }, [location])

  return (
    <div className="min-h-screen bg-indigo-900 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans text-center selection:bg-indigo-500">

      {/* Efek Kembang Api / Cahaya Latar */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-indigo-500/40 via-transparent to-transparent animate-pulse z-0"></div>

      <div className="relative z-10 w-full max-w-md">

        {/* Label Selebrasi */}
        <div className="text-6xl md:text-8xl mb-6 drop-shadow-2xl animate-bounce">
          🏆
        </div>

        <div className="space-y-2 mb-8">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-md italic uppercase">
              Mantap, {playerName}!
            </h1>
            <p className="text-indigo-300 font-black uppercase tracking-[0.3em] text-xs">Permainan Telah Berakhir</p>
        </div>

        {/* KOTAK SKOR */}
        <div className="bg-white p-8 md:p-10 rounded-[3.5rem] shadow-2xl relative border-[12px] border-white/10">

          <h2 className="text-slate-400 font-black uppercase tracking-widest text-xs mb-2">Total Score</h2>
          <h1 className="text-8xl font-black text-indigo-600 mb-6 drop-shadow-sm tracking-tighter">
            {score}
          </h1>

          <div className="bg-indigo-50 border-2 border-indigo-100 rounded-3xl p-5 flex items-center justify-between mb-10">
            <span className="font-black text-slate-500 uppercase text-xs tracking-wider">Akurasi Jawaban</span>
            <span className={`font-black text-2xl ${accuracy >= 70 ? 'text-emerald-500' : 'text-amber-500'}`}>
                {accuracy}%
            </span>
          </div>

          <div className="flex flex-col gap-3">
              <button 
                onClick={() => navigate("/student/join")} // 🎯 Kembali ke entry kuis
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xl py-5 rounded-3xl shadow-[0_8px_0_rgb(67,56,202)] hover:translate-y-1 hover:shadow-[0_4px_0_rgb(67,56,202)] transition-all active:translate-y-2 active:shadow-none"
              >
                Main Lagi 🕹️
              </button>

              <button 
                onClick={() => navigate("/student/dashboard")} // 🎯 Kembali ke Dashboard
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-black text-sm py-4 rounded-3xl transition-all"
              >
                Ke Dashboard
              </button>
          </div>
        </div>

        <p className="mt-10 text-white/30 font-black text-[10px] uppercase tracking-[0.5em]">
            WordIT Engine • ITS Surabaya
        </p>

      </div>
    </div>
  )
}