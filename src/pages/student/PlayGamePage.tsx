import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GameRenderer from "../../components/game/GameRenderer";
import { getGameById, getGameByCode, finishGame } from "../services/game.service";
import socket from "../../hooks/useSocket";
import { toast } from "react-hot-toast";

export default function PlayGamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [showOverlay, setShowOverlay] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [overlayCountdown, setOverlayCountdown] = useState(3);

  const playerName = sessionStorage.getItem("playerName") || "Player";

  useEffect(() => {
    const loadGameArena = async () => {
      if (!gameId) return;

      try {
        setLoading(true);
        let data;
        if (gameId.length === 6) {
          data = await getGameByCode(gameId.toUpperCase());
        } else {
          data = await getGameById(gameId);
        }

        const finalData = (data as any).data || data;
        if (!finalData) throw new Error("Data game tidak ditemukan.");

        setGame(finalData);
        if (finalData.shareCode) {
          socket.emit("joinGame", finalData.shareCode);
        }
      } catch (err: any) {
        toast.error("Gagal memuat arena.");
        navigate("/student/dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadGameArena();
  }, [gameId, navigate]);

  useEffect(() => {
    const handleGameFinished = () => {
      toast.error("Sesi telah berakhir.", { icon: "🛑" });
      handleGameOver();
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
  }, [navigate, gameId, game]); // Menambahkan dependensi agar state terpantau

  const handleGameOver = async () => {
    // 🎯 FIX: Pastikan gunakan ID UUID database, bukan Share Code
    const realGameId = game?.id || game?._id || gameId;

    const score = parseInt(sessionStorage.getItem("lastScore") || "0");
    const accuracy = parseInt(sessionStorage.getItem("lastAccuracy") || "0");
    const rawBreakdown = sessionStorage.getItem("lastBreakdown");
    const breakdown = rawBreakdown ? JSON.parse(rawBreakdown) : [];

    try {
      // 🎯 BE-12: Kirim Real ID agar backend tidak Error 500
      await finishGame(realGameId!, {
        scoreValue: score,
        maxScore: (game?.gameJson?.questions?.length || 1) * 100,
        accuracy: accuracy,
        timeSpent: 0,
        answersDetail: breakdown
      });
    } catch (e) {
      console.warn("Autosave gagal, melanjutkan ke halaman hasil.");
    }

    navigate("/student/result", {
      state: { score, accuracy, breakdown }
    });
  };

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

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center font-sans">
      <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-6 text-indigo-400 font-black uppercase tracking-widest text-[10px]">Loading Arena...</p>
    </div>
  );

  const sortedLeaderboard = [...leaderboard].sort((a, b) => b.score - a.score);
  const myRankIndex = sortedLeaderboard.findIndex(p => p.name === playerName);

  // 🎯 FIX: Jika ranking dari socket belum update, paksa tampilkan skor dari sessionStorage 
  // agar pop-up ranking tidak menunjukkan 0 PTS saat intermission soal.
  const currentLocalScore = parseInt(sessionStorage.getItem("lastScore") || "0");

  const myScore = myRankIndex !== -1
    ? Math.max(sortedLeaderboard[myRankIndex].score, currentLocalScore)
    : currentLocalScore;

  const myRank = myRankIndex !== -1 ? myRankIndex + 1 : "-";

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans relative overflow-hidden selection:bg-transparent">
      {showOverlay && (
        <div className="fixed inset-0 bg-slate-900/95 z-50 flex flex-col items-center justify-center animate-in fade-in duration-300">
          <h2 className="text-white font-black text-2xl uppercase tracking-widest mb-10 italic">Peringkat Sementara</h2>
          <div className="bg-indigo-600 p-8 rounded-[2.5rem] shadow-2xl mb-10 flex items-center gap-6 border-4 border-indigo-400">
            <div className="w-16 h-16 bg-white text-indigo-600 rounded-full flex items-center justify-center text-2xl font-black">#{myRank}</div>
            <div>
              <p className="text-white font-black text-xl uppercase">{playerName}</p>
              <p className="text-indigo-200 font-bold">{myScore} PTS</p>
            </div>
          </div>
          <div className="text-white font-black text-8xl opacity-20 animate-ping">{overlayCountdown}</div>
        </div>
      )}

      <div className="bg-slate-800/50 backdrop-blur-md px-8 py-4 flex justify-between items-center border-b border-white/5 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-white opacity-50 hover:opacity-100 transition-opacity text-xl">❮</button>
          <div>
            <h1 className="font-black text-white text-lg tracking-tight">{game?.title}</h1>
            <p className="text-indigo-400 text-[9px] font-black uppercase tracking-widest">{game?.templateType?.replace('_', ' ')}</p>
          </div>
        </div>
        <div className="bg-white/10 px-4 py-2 rounded-full border border-white/10">
          <span className="text-white font-black text-xs uppercase tracking-tighter">Rank #{myRank}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-4 md:p-8 relative z-10">
        <div className="bg-white flex-1 rounded-[3.5rem] border-[12px] border-slate-800 overflow-hidden relative flex items-center justify-center shadow-inner">
          {game && (
            <GameRenderer
              templateType={String(game.templateType)}
              gameData={game}
              onIntermission={handleIntermission}
              // @ts-ignore
              onGameOver={handleGameOver}
            />
          )}
        </div>
      </div>
    </div>
  );
}