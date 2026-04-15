import { useSearchParams } from "react-router-dom"
import GameRenderer from "../../../components/game/GameRenderer"

export default function PreviewGamePage() {
  const [params] = useSearchParams()
  const template = params.get("template")

  const mockGame = {
    templateType: template || "ANAGRAM",
    data: {},
  }

  return (
    <div className="min-h-screen bg-slate-900 font-sans flex flex-col items-center py-12 px-6 overflow-hidden">
      <div className="max-w-4xl w-full">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Game Preview 🕹️</h1>
            <p className="text-slate-400 font-bold">Melihat tampilan game saat dimainkan siswa</p>
          </div>
          <div className="bg-indigo-500 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest animate-pulse">
            Live Mode
          </div>
        </div>

        {/* Mockup Frame */}
        <div className="relative mx-auto w-full max-w-[800px] bg-slate-800 p-4 md:p-8 rounded-[3rem] border-[12px] border-slate-700 shadow-2xl overflow-hidden min-h-[500px]">
          {/* Subtle reflection effect */}
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

          <div className="relative bg-white rounded-[2rem] overflow-hidden min-h-[400px]">
            <GameRenderer
              templateType={mockGame.templateType}
              gameData={mockGame.data}
            />
          </div>
        </div>

        <p className="text-center text-slate-500 mt-8 font-bold text-sm italic">
          Tip: Gunakan tampilan ini untuk memastikan soal dan gambar terlihat jelas.
        </p>
      </div>
    </div>
  )
}