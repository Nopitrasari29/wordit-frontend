import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GameRenderer from "../../components/game/GameRenderer";
import { getGameById, getGameByCode } from "../services/game.service";
import socket from "../../hooks/useSocket";
import { toast } from "react-hot-toast";

export default function PlayGamePage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 🎯 FE-16: OVERLAY RANKING STATE
  const [showOverlay, setShowOverlay] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [overlayCountdown, setOverlayCountdown] = useState(3);

  const playerName = sessionStorage.getItem("playerName") || "Player";

  useEffect(() => {
    const loadGameArena = async () => {
      if (!gameId) return;

      try {
        setLoading(true);
        let response;
        if (gameId.length === 6) {
          response = await getGameByCode(gameId);
        } else {
          response = await getGameById(gameId);
        }

        const finalData = (response as any).data || response;

        if (!finalData) {
          throw new Error("Data game tidak ditemukan.");
        }

        setGame(finalData);

        // Langsung join socket sebagai player agar dapat update leaderboard
        if (finalData.shareCode) {
            socket.emit("joinGame", finalData.shareCode);
        }
      } catch (err: any) {
        console.error("Play Error:", err);
        toast.error("Gagal memuat arena permainan. 🌵");

        const role = JSON.parse(localStorage.getItem("user") || "{}").role;
        navigate(role === "TEACHER" ? "/teacher/projects" : "/student/dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadGameArena();
  }, [gameId, navigate]);

  // 🎯 SINKRONISASI SOCKET
  useEffect(() => {
    const handleGameFinished = () => {
      toast.error("Waktu Habis! Guru telah mengakhiri sesi.", { icon: "🛑" });

      const score = parseInt(sessionStorage.getItem("lastScore") || "0");
      const accuracy = parseInt(sessionStorage.getItem("lastAccuracy") || "0");

      navigate("/student/result", { state: { score, accuracy } });
    };

    const handleUpdatePlayerList = (newList: any[]) => {
      setLeaderboard(newList);
    };

    socket.on("gameFinished", handleGameFinished);
    socket.on("updatePlayerList", handleUpdatePlayerList);

    return () => {
      socket.off("gameFinished", handleGameFinished);
      socket.off("updatePlayerList", handleUpdatePlayerList);
    };
  }, [navigate]);

  // FUNGSI TRIGGER OVERLAY DARI ENGINE
  const handleIntermission = () => {
      setShowOverlay(true);
      setOverlayCountdown(3);

      const timer = setInterval(() => {
          setOverlayCountdown((prev) => {
              if (prev <= 1) {
                  clearInterval(timer);
                  setShowOverlay(false);
                  return 0;
              }
              return prev - 1;
          });
      }, 1000);
  };

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

  // Cari posisi player saat ini
  const sortedLeaderboard = [...leaderboard].sort((a, b) => b.score - a.score);
  const myRankIndex = sortedLeaderboard.findIndex(p => p.name === playerName);
  const myRank = myRankIndex !== -1 ? myRankIndex + 1 : "-";
  const myScore = myRankIndex !== -1 ? sortedLeaderboard[myRankIndex].score : 0;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans selection:bg-transparent overflow-hidden relative">
      
      {/* 🎯 FE-16: OVERLAY RANKING (Hanya muncul saat antar-soal) */}
      {showOverlay && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-50 flex flex-col items-center justify-center animate-in fade-in duration-300">
            <h2 className="text-white font-black text-3xl uppercase tracking-widest italic mb-2">Klasemen Sementara</h2>
            <p className="text-indigo-400 font-bold mb-10 text-sm">Bersiap untuk soal berikutnya...</p>
            
            {/* Posisi Saya */}
            <div className="bg-indigo-600 border-4 border-indigo-400 p-6 rounded-[2.5rem] shadow-2xl mb-10 flex items-center gap-6 transform scale-110">
                <div className="w-16 h-16 bg-white text-indigo-600 rounded-full flex items-center justify-center text-3xl font-black shadow-inner">
                    #{myRank}
                </div>
                <div>
                    <p className="text-white font-black text-2xl uppercase">{playerName}</p>
                    <p className="text-indigo-200 font-black tracking-widest">{myScore} PTS</p>
                </div>
            </div>

            {/* Top 3 */}
            <div className="flex gap-4 mb-10">
                {sortedLeaderboard.slice(0, 3).map((player, idx) => (
                    <div key={idx} className="bg-white/10 p-4 rounded-2xl border border-white/20 text-center w-32 flex flex-col items-center">
                        <span className="text-2xl mb-2">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>
                        <p className="text-white font-black text-xs uppercase truncate w-full">{player.name}</p>
                        <p className="text-indigo-300 text-[10px] font-black">{player.score}</p>
                    </div>
                ))}
            </div>

            <div className="text-8xl font-black text-white opacity-20 absolute bottom-10 animate-ping">
                {overlayCountdown}
            </div>
        </div>
      )}

      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px]"></div>
      </div>

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

        {/* Live Rank Mini Indicator */}
        <div className="bg-white/10 border border-white/20 px-4 py-2 rounded-full flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-white font-black text-xs uppercase">Rank #{myRank}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-4 md:p-10 w-full relative z-10">
        <div className="bg-white flex-1 rounded-[4.5rem] shadow-2xl border-[14px] border-slate-800 overflow-hidden relative flex items-center justify-center group">
          {game && (
            <GameRenderer
              templateType={String(game.templateType)}
              gameData={game}
              onIntermission={handleIntermission}
            />
          )}
        </div>
      </div>

      <div className="py-6 text-center opacity-30 z-10">
        <p className="text-white font-black text-[10px] uppercase tracking-[0.6em]">
          WordIT Engine v2.0
        </p>
      </div>
    </div>
  );
}
