import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import socket from "../../hooks/useSocket"
// 🎯 FIX 1: Ubah getGame menjadi getGameById agar sesuai dengan service terbaru
import { getGameById } from "../services/game.service" 
import GameRenderer from "../../components/game/GameRenderer"

export default function GameSessionPage() {
  const { sessionId } = useParams() // Ini biasanya berisi ID atau shareCode kuis
  const [game, setGame] = useState<any>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function load() {
      if (!sessionId) return
      try {
        // 🎯 FIX 2: Memanggil fungsi getGameById
        const data = await getGameById(sessionId)
        setGame(data)
        
        // Emit socket setelah data kuis berhasil dimuat
        socket.emit("joinGame", sessionId)
      } catch (err) {
        console.error("Gagal memuat sesi game:", err)
        setError(true)
      }
    }
    load()
  }, [sessionId])

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-rose-50 p-6 text-center">
        <div className="text-6xl mb-4">🏜️</div>
        <h2 className="text-2xl font-black text-rose-600 uppercase italic">Sesi Tidak Ditemukan</h2>
        <p className="text-rose-400 font-bold max-w-xs mt-2">Pastikan ID Game benar atau kuis sudah dipublikasikan.</p>
      </div>
    )
  }

  if (!game) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-16 h-16 border-8 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="mt-4 font-black text-indigo-600 animate-pulse uppercase tracking-widest text-[10px]">Menyiapkan Sesi Game...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-2xl group-hover:scale-110 transition-transform">🎮</div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Game Session</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aktivitas: {game.title}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden border-[8px] border-white min-h-[600px] flex items-center justify-center relative">
          {/* Dekorasi Background Lembut */}
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none"></div>

          {/* 🎯 FIX 3: Mengirim props yang diwajibkan oleh GameRenderer */}
          <GameRenderer 
            templateType={game.templateType} 
            gameData={game} 
          />
        </div>
      </div>
    </div>
  )
}