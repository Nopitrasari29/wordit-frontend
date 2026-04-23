import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"

export default function ResultPage() {
  const navigate = useNavigate()
  const location = useLocation()
  
  const [score, setScore] = useState(0)
  const [accuracy, setAccuracy] = useState(0)
  const [playerName, setPlayerName] = useState("Guest")
  const [breakdown, setBreakdown] = useState<any[]>([])

  useEffect(() => {
    const savedName = sessionStorage.getItem("playerName") || "Player"
    setPlayerName(savedName)

    const finalScore = location.state?.score ?? parseInt(sessionStorage.getItem("lastScore") || "0")
    const finalAccuracy = location.state?.accuracy ?? parseInt(sessionStorage.getItem("lastAccuracy") || "0")
    
    setScore(finalScore)
    setAccuracy(finalAccuracy)

    // Parse breakdown history
    try {
        const rawBreakdown = sessionStorage.getItem("lastBreakdown")
        if (rawBreakdown) {
            setBreakdown(JSON.parse(rawBreakdown))
        }
    } catch (e) {
        console.error("Failed to parse breakdown", e)
    }
  }, [location])

  // Hitung Bintang 1-5 berdasarkan Akurasi
  const getStars = (acc: number) => {
      if (acc >= 90) return 5;
      if (acc >= 70) return 4;
      if (acc >= 50) return 3;
      if (acc >= 30) return 2;
      if (acc > 0) return 1;
      return 0;
  }

  const starsCount = getStars(accuracy);

  return (
    <div className="min-h-screen bg-indigo-900 flex flex-col items-center py-12 px-4 relative font-sans selection:bg-indigo-500 overflow-y-auto">

      {/* Efek Kembang Api / Cahaya Latar */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-indigo-500/40 via-transparent to-transparent animate-pulse z-0 pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-2xl flex flex-col gap-8">

        {/* HEADER */}
        <div className="text-center">
            <div className="text-6xl md:text-8xl mb-4 drop-shadow-2xl animate-bounce">
            🏆
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-md italic uppercase">
            Mantap, {playerName}!
            </h1>
            <p className="text-indigo-300 font-black uppercase tracking-[0.3em] text-xs mt-2">Permainan Telah Berakhir</p>
        </div>

        {/* KOTAK SKOR UTAMA */}
        <div className="bg-white p-8 md:p-10 rounded-[3.5rem] shadow-2xl relative border-[12px] border-white/10 text-center">
          
          {/* Rating Bintang */}
          <div className="flex justify-center gap-2 mb-6">
              {[...Array(5)].map((_, i) => (
                  <span key={i} className={`text-4xl transition-all duration-500 ${i < starsCount ? 'text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)] scale-110' : 'text-slate-200 grayscale opacity-50'}`}>
                      ⭐
                  </span>
              ))}
          </div>

          <h2 className="text-slate-400 font-black uppercase tracking-widest text-xs mb-2">Total Score</h2>
          <h1 className="text-8xl font-black text-indigo-600 mb-6 drop-shadow-sm tracking-tighter">
            {score}
          </h1>

          <div className="bg-indigo-50 border-2 border-indigo-100 rounded-3xl p-5 flex items-center justify-between mb-8">
            <span className="font-black text-slate-500 uppercase text-xs tracking-wider">Akurasi Jawaban</span>
            <span className={`font-black text-3xl ${accuracy >= 70 ? 'text-emerald-500' : 'text-amber-500'}`}>
                {accuracy}%
            </span>
          </div>

          {/* TABEL BREAKDOWN (Jika Ada) */}
          {breakdown && breakdown.length > 0 && (
              <div className="mt-8 mb-8 text-left border-t-2 border-slate-100 pt-8">
                  <h3 className="text-slate-800 font-black text-xl italic uppercase tracking-tighter mb-4">Riwayat Jawaban</h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                      {breakdown.map((item, idx) => (
                          <div key={idx} className={`p-4 rounded-2xl flex items-center justify-between border-2 ${item.isCorrect ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                              <div className="flex items-center gap-4">
                                  <span className="text-2xl">{item.isCorrect ? '✅' : '❌'}</span>
                                  <div>
                                      <p className="font-black text-slate-700">{item.word || `Soal ${idx + 1}`}</p>
                                      {item.time && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.time}s</p>}
                                  </div>
                              </div>
                              <span className={`font-black text-lg ${item.isCorrect ? 'text-emerald-500' : 'text-rose-500'}`}>
                                  {item.isCorrect ? '+ Poin' : '0 Poin'}
                              </span>
                          </div>
                      ))}
                  </div>
              </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => navigate("/student/join")} 
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xl py-5 rounded-3xl shadow-[0_8px_0_rgb(67,56,202)] hover:translate-y-1 hover:shadow-[0_4px_0_rgb(67,56,202)] transition-all active:translate-y-2 active:shadow-none"
              >
                Main Lagi 🕹️
              </button>

              <button 
                onClick={() => navigate("/student/dashboard")} 
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-500 font-black text-sm py-4 rounded-3xl transition-all"
              >
                Ke Dashboard
              </button>
          </div>
        </div>

        <p className="mt-4 text-center text-white/30 font-black text-[10px] uppercase tracking-[0.5em]">
            WordIT Engine • ITS Surabaya
        </p>

      </div>
    </div>
  )
}