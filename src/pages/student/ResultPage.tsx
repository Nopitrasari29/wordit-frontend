import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Bot, Sparkles, Loader2 } from "lucide-react"

export default function ResultPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const [score, setScore] = useState(0)
  const [accuracy, setAccuracy] = useState(0)
  const [playerName, setPlayerName] = useState("Guest")
  const [breakdown, setBreakdown] = useState<any[]>([])

  // 🤖 AI Feedback States
  const [activeFeedbackIndex, setActiveFeedbackIndex] = useState<number | null>(null)
  const [isAILoading, setIsAILoading] = useState(false)
  const [aiExplanations, setAiExplanations] = useState<{ [key: number]: string }>({})

  useEffect(() => {
    const savedName = sessionStorage.getItem("playerName") || "Player"
    setPlayerName(savedName)

    // 🎯 FE-15: Ambil data dari state navigasi (prioritas) atau session storage (fallback)
    const finalScore = location.state?.score ?? parseInt(sessionStorage.getItem("lastScore") || "0")
    const finalAccuracy = location.state?.accuracy ?? parseInt(sessionStorage.getItem("lastAccuracy") || "0")
    const finalBreakdown = location.state?.breakdown ?? []

    setScore(finalScore)
    setAccuracy(finalAccuracy)

    if (finalBreakdown.length > 0) {
      setBreakdown(finalBreakdown)
    } else {
      try {
        const raw = sessionStorage.getItem("lastBreakdown")
        if (raw) setBreakdown(JSON.parse(raw))
      } catch (e) { console.error("Failed to parse breakdown", e) }
    }
  }, [location])

  const getStars = (acc: number) => {
    if (acc >= 90) return 5;
    if (acc >= 70) return 4;
    if (acc >= 50) return 3;
    if (acc >= 30) return 2;
    return acc > 0 ? 1 : 0;
  }

  const starsCount = getStars(accuracy);

  // 🤖 Trigger AI Feedback
  const handleAskAI = async (item: any, index: number) => {
    // Jika sedang buka yang sama, tutup
    if (activeFeedbackIndex === index) {
      setActiveFeedbackIndex(null);
      return;
    }

    setActiveFeedbackIndex(index);

    // Jika sudah pernah di-generate, tidak usah loading lagi
    if (aiExplanations[index]) return;

    setIsAILoading(true);

    try {
      // TODO: Ganti ini dengan panggilan API beneran ke ai.service.ts
      // const explanation = await explainWrongAnswerWithAI(item.question, item.selectedAnswer);

      // Simulasi Loading Groq AI (Hapus ini kalau API asli sudah jadi)
      const explanation = await new Promise<string>((resolve) => {
        setTimeout(() => {
          resolve(`Menurut analisis AI, jawaban "${item.selectedAnswer || item.word || 'yang kamu pilih'}" kurang tepat. Jawaban yang benar kemungkinan berkaitan dengan konsep utama dari soal ini. Jangan menyerah, yuk pelajari lagi materinya!`);
        }, 1500);
      });

      setAiExplanations(prev => ({ ...prev, [index]: explanation }));
    } catch (error) {
      setAiExplanations(prev => ({ ...prev, [index]: "Waduh, AI sedang sibuk. Coba tanya lagi nanti ya!" }));
    } finally {
      setIsAILoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-indigo-900 flex flex-col items-center py-12 px-4 relative font-sans selection:bg-indigo-500 overflow-y-auto">

      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-indigo-500/40 via-transparent to-transparent animate-pulse z-0 pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-2xl flex flex-col gap-8">

        {/* HEADER */}
        <div className="text-center">
          <div className="text-6xl md:text-8xl mb-4 drop-shadow-2xl animate-bounce">🏆</div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-md italic uppercase">
            Mantap, {playerName}!
          </h1>
          <p className="text-indigo-300 font-black uppercase tracking-[0.3em] text-xs mt-2">Permainan Telah Berakhir</p>
        </div>

        {/* KOTAK SKOR UTAMA */}
        <div className="bg-white p-8 md:p-10 rounded-[3.5rem] shadow-2xl relative border-[12px] border-white/10 text-center">

          <div className="flex justify-center gap-2 mb-6">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={`text-4xl transition-all duration-500 ${i < starsCount ? 'text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)] scale-110' : 'text-slate-200 grayscale opacity-50'}`}>⭐</span>
            ))}
          </div>

          <h2 className="text-slate-400 font-black uppercase tracking-widest text-xs mb-2">Total Score</h2>
          <h1 className="text-8xl font-black text-indigo-600 mb-6 drop-shadow-sm tracking-tighter">
            {score}
          </h1>

          <div className="bg-indigo-50 border-2 border-indigo-100 rounded-3xl p-5 flex items-center justify-between mb-8">
            <span className="font-black text-slate-500 uppercase text-xs tracking-wider">Akurasi Jawaban</span>
            <span className={`font-black text-3xl ${accuracy >= 70 ? 'text-emerald-500' : 'text-amber-500'}`}>{accuracy}%</span>
          </div>

          {/* TABEL BREAKDOWN & AI FEEDBACK (FE-18) */}
          {breakdown && breakdown.length > 0 && (
            <div className="mt-8 mb-8 text-left border-t-2 border-slate-100 pt-8">
              <h3 className="text-slate-800 font-black text-xl italic uppercase tracking-tighter mb-4">Riwayat Jawaban</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {breakdown.map((item, idx) => (
                  <div key={idx} className="flex flex-col gap-2 animate-fade-in">

                    {/* Item Jawaban */}
                    <div className={`p-4 rounded-2xl flex items-center justify-between border-2 transition-all ${item.isCorrect ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                      <div className="flex items-center gap-4">
                        <span className="text-2xl shrink-0">{item.isCorrect ? '✅' : '❌'}</span>
                        <div>
                          <p className="font-black text-slate-700 uppercase leading-tight line-clamp-2 pr-2">
                            {item.question || item.word || `Soal ${idx + 1}`}
                          </p>
                          {item.time && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{item.time}s</p>}
                        </div>
                      </div>

                      <div className="flex flex-col items-end shrink-0 gap-2">
                        <span className={`font-black text-lg ${item.isCorrect ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {item.isCorrect ? '+ Poin' : '0 Poin'}
                        </span>

                        {/* 🤖 Tombol Tanya AI (Hanya muncul jika Salah) */}
                        {!item.isCorrect && (
                          <button
                            onClick={() => handleAskAI(item, idx)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 ${activeFeedbackIndex === idx ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'}`}
                          >
                            <Bot size={14} />
                            {activeFeedbackIndex === idx ? 'Tutup' : 'Tanya AI'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 🤖 Box Penjelasan AI yang terbuka ke bawah */}
                    {!item.isCorrect && activeFeedbackIndex === idx && (
                      <div className="bg-indigo-50 border-2 border-indigo-100 p-5 rounded-2xl ml-4 sm:ml-12 relative animate-fade-in">
                        <div className="absolute -top-2 left-6 w-4 h-4 bg-indigo-50 rotate-45 border-l-2 border-t-2 border-indigo-100"></div>

                        <div className="flex items-start gap-3 relative z-10">
                          <div className="bg-indigo-600 text-white p-2 rounded-xl shrink-0">
                            {isAILoading && !aiExplanations[idx] ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                          </div>
                          <div>
                            <h4 className="font-black text-indigo-800 text-xs uppercase tracking-widest mb-1">AI Teacher Feedback</h4>
                            <p className="text-sm font-bold text-indigo-900/80 leading-relaxed">
                              {isAILoading && !aiExplanations[idx] ? (
                                <span className="animate-pulse">Sedang menganalisis jawabanmu...</span>
                              ) : (
                                aiExplanations[idx]
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

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
        <p className="mt-4 text-center text-white/30 font-black text-[10px] uppercase tracking-[0.5em]">WordIT Engine • ITS Surabaya</p>
      </div>
    </div>
  )
}