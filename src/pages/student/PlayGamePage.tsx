import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
// 🎯 PASTIKAN: Import mengarah ke GameRenderer (untuk MAIN), bukan GameBuilderRouter!
import GameRenderer from "../../components/game/GameRenderer";
import { getGameById } from "../services/game.service";
import { toast } from "react-hot-toast";

export default function PlayGamePage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGameArena = async () => {
      if (!gameId) return;

      try {
        setLoading(true);
        // 📡 Ambil data kuis dari database PostgreSQL melalui API
        const response = await getGameById(gameId);
        
        // 🛠️ Proteksi Data: Ambil dari .data jika formatnya Axios
        const finalData = (response as any).data || response;

        if (!finalData) {
          throw new Error("Data game tidak ditemukan.");
        }

        console.log("🎮 ARENA DIMUAT:", finalData);
        setGame(finalData);
      } catch (err: any) {
        console.error("Play Error:", err);
        toast.error("Waduh, gagal masuk arena, Nop! 🌵");
        navigate("/teacher/projects"); 
      } finally {
        setLoading(false);
      }
    };

    loadGameArena();
  }, [gameId, navigate]);

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center font-sans">
        <div className="w-20 h-20 border-8 border-indigo-600 border-t-transparent rounded-full animate-spin shadow-2xl shadow-indigo-500/20"></div>
        <p className="mt-8 font-black text-indigo-400 uppercase tracking-[0.5em] animate-pulse text-xs">
           Entering Arena...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans selection:bg-transparent overflow-hidden relative">
      
      {/* Visual Background Glow */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px]"></div>
      </div>

      {/* TOP NAVBAR */}
      <div className="bg-slate-800/40 backdrop-blur-xl px-10 py-6 flex justify-between items-center z-10 shrink-0 border-b border-white/5 relative">
        <div className="flex items-center gap-5">
          <button 
            onClick={() => navigate(-1)}
            className="w-12 h-12 bg-white/5 hover:bg-white/10 text-white rounded-2xl flex items-center justify-center transition-all group border border-white/10"
          >
            <span className="group-hover:-translate-x-1 transition-transform text-xl">❮</span>
          </button>
          <div>
            <h1 className="font-black text-white text-xl md:text-3xl tracking-tighter italic leading-none">
              {game?.title || "Untitled Activity"}
            </h1>
            <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">
              {game?.templateType?.replace("_", " ")} Mode
            </p>
          </div>
        </div>
      </div>

      {/* ARENA UTAMA */}
      <div className="flex-1 flex flex-col p-4 md:p-10 w-full relative z-10">
        <div className="bg-white flex-1 rounded-[4.5rem] shadow-2xl border-[14px] border-slate-800 overflow-hidden relative flex items-center justify-center group">
          
          {/* 🎯 KUNCI PATEN: Pastikan prop yang dikirim adalah STRING templateType-nya saja */}
          {game && (
            <GameRenderer
              templateType={String(game.templateType)} 
              gameData={game}
            />
          )}

        </div>
      </div>

      <div className="py-6 text-center opacity-30">
         <p className="text-white font-black text-[10px] uppercase tracking-[0.6em]">
            WordIT Engine v2.0 • Paten by Nopi
         </p>
      </div>

    </div>
  );
}