import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"

export default function JoinGamePage() {
  const [code, setCode] = useState("")
  const navigate = useNavigate()

  function handleJoin() {
    // 🔍 Validasi: Pastikan kode tidak kosong
    if (!code.trim()) {
      return toast.error("Ketik kode kuis terlebih dahulu! 🌵");
    }
    
    /**
     * 🎯 SINKRONISASI ALUR (Quizizz Style):
     * Kita tidak langsung ke Lobby, tapi ke halaman 'Enter Player' 
     * untuk mengambil nama siswa terlebih dahulu.
     * Path: /student/game/enter?code=...
     */
    const cleanCode = code.toUpperCase().trim();
    navigate(`/student/game/enter?code=${cleanCode}`); 
  }

  return (
    <div className="min-h-screen bg-indigo-600 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans pt-28 pb-12">

      {/* Pattern Background Ceria */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/30 rounded-full blur-3xl"></div>

      <div className="relative z-10 w-full max-w-lg text-center">
        {/* Logo WordIT */}
        <h1 className="text-6xl md:text-8xl font-black text-white mb-10 tracking-tighter drop-shadow-xl italic">
          Word<span className="text-blue-300">IT</span>
        </h1>

        <div className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-2xl border-[10px] border-white/20">
          <h2 className="text-2xl font-black text-slate-800 mb-8 tracking-tight italic">Siap Bermain? 🎮</h2>

          <input
            placeholder="KODE KUIS"
            value={code}
            // 🛠️ Auto Uppercase & Limit karakter agar rapi
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="w-full bg-slate-100 text-center text-4xl md:text-5xl font-black text-indigo-600 py-6 rounded-3xl border-4 border-slate-200 focus:border-indigo-500 focus:bg-white focus:outline-none uppercase tracking-widest mb-6 transition-all placeholder:text-slate-300 placeholder:tracking-normal placeholder:text-xl"
          />

          <button
            onClick={handleJoin}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-2xl font-black py-6 rounded-3xl shadow-[0_10px_0_rgb(67,56,202)] hover:translate-y-1 hover:shadow-[0_6px_0_rgb(67,56,202)] active:translate-y-3 active:shadow-none transition-all uppercase tracking-tighter italic"
          >
            LANJUT ➔
          </button>
        </div>
        
        <p className="mt-8 text-white/50 font-black text-[10px] uppercase tracking-[0.5em]">
          ITS SURABAYA • WORDIT ENGINE v2.0
        </p>
      </div>
    </div>
  )
}