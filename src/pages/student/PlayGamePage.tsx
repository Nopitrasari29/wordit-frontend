import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GameRenderer from "../../components/game/GameRenderer";
import { getGameById, getGameByCode, finishGame, playGame } from "../services/game.service";
import socket from "../../hooks/useSocket";
import { toast } from "react-hot-toast";
import RankingOverlay from "../../components/game/common/RankingOverlay";
import { useAuth } from "../../hooks/useAuth";

export default function PlayGamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [showOverlay, setShowOverlay] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [overlayCountdown, setOverlayCountdown] = useState(3);

  // State untuk local score (Guest & Teacher)
  const [localScoreResult, setLocalScoreResult] = useState<any>(null);

  const { user } = useAuth();
  const isStudent = user && user.role === "STUDENT";
  const playerName = sessionStorage.getItem("playerName") || "Player";

  useEffect(() => {
    const playerName = sessionStorage.getItem("playerName") || "Player";

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

        // 🧠 Panggil endpoint /play untuk start session game & dapatkan rekomendasi difficulty (Hanya untuk Student)
        if (isStudent) {
          try {
            const savedPlayerName = sessionStorage.getItem("playerName") || "Player";
            const sessionData = await playGame(finalData.id || finalData._id, savedPlayerName);
            if (sessionData && sessionData.recommendedDifficulty) {
              finalData.recommendedDifficulty = sessionData.recommendedDifficulty;
            }
          } catch (playErr) {
            console.warn("⚠️ Gagal memulai sesi bermain (playGame):", playErr);
          }
        }

        setGame(finalData);
        if (finalData.shareCode) {
          socket.emit("joinGame", { code: finalData.shareCode, playerName });
          if (isStudent) {
            sessionStorage.setItem("activeGameRoom", finalData.shareCode);
            sessionStorage.setItem("activeGameId", finalData.id || finalData._id);
          }
        }
      } catch (err: any) {
        toast.error("Gagal memuat arena.");
        navigate("/student/dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadGameArena();
  }, [gameId, navigate, isStudent]);

  useEffect(() => {
    const joinRoom = (shareCode: string) => {
      socket.emit("joinGame", { code: shareCode, playerName });
    };

    const handleGameFinished = () => {
      sessionStorage.removeItem("activeGameRoom");
      sessionStorage.removeItem("activeGameId");

      toast.error("Sesi telah berakhir.", { icon: "🛑" });

      navigate("/student/result", {
        state: {
          score: Number(sessionStorage.getItem("lastScore")) || 0,
          accuracy: Number(sessionStorage.getItem("lastAccuracy")) || 0,
          breakdown: JSON.parse(sessionStorage.getItem("lastBreakdown") || "[]"),
        },
      });
    };

    const handleUpdatePlayerList = (newList: any[]) => {
      setLeaderboard(newList);
    };

    const handlePlayerKicked = () => {
      toast.error("Anda telah dikeluarkan oleh guru.");
      navigate("/student/join");
    };

    const handleHostDisconnected = () => {
      toast.error("Guru mengakhiri sesi.");
      navigate("/student/join");
    };

    const handleConnect = () => {
      if (game?.shareCode) {
        joinRoom(game.shareCode);
      }
    };

    socket.on("gameFinished", handleGameFinished);
    socket.on("updatePlayerList", handleUpdatePlayerList);
    socket.on("playerKicked", handlePlayerKicked);
    socket.on("hostDisconnected", handleHostDisconnected);
    socket.on("connect", handleConnect);

    return () => {
      socket.off("gameFinished", handleGameFinished);
      socket.off("updatePlayerList", handleUpdatePlayerList);
      socket.off("playerKicked", handlePlayerKicked);
      socket.off("hostDisconnected", handleHostDisconnected);
      socket.off("connect", handleConnect);
    };
  }, [navigate, gameId, game, playerName]);

      const handleGameOver = async (scoreOverride?: number, accuracyOverride?: number, breakdownOverride?: any[]) => {
      // 🛠️ PERBAIKAN: Gunakan local variable tracking alih-alih mengandalkan state blocking instan
      if ((window as any)._worditFinishing) return; 
      (window as any)._worditFinishing = true;

      const realGameId = game?.id || game?._id || gameId;
      const score = scoreOverride !== undefined ? scoreOverride : parseInt(sessionStorage.getItem("lastScore") || "0");
      const accuracyRaw = accuracyOverride !== undefined ? accuracyOverride : parseInt(sessionStorage.getItem("lastAccuracy") || "0");
      const rawBreakdown = breakdownOverride ? JSON.stringify(breakdownOverride) : sessionStorage.getItem("lastBreakdown");
      let breakdown = [];

      try {
        breakdown = rawBreakdown ? JSON.parse(rawBreakdown) : [];
      } catch {
        breakdown = [];
      }

      const totalQuestions = game?.gameJson?.questions?.length || game?.gameJson?.words?.length || game?.gameJson?.pairs?.length || 0;
      
      if (totalQuestions > breakdown.length) {
          const remainingCount = totalQuestions - breakdown.length;
          for (let i = 0; i < remainingCount; i++) {
              breakdown.push({
                  question: "Tidak terjawab (Waktu habis)",
                  isCorrect: false,
                  selectedAnswer: null,
                  correctAnswer: "Waktu Habis"
              });
          }
      }

      const finalAccuracy = totalQuestions > 0 ? Math.round((breakdown.filter((b: any) => b.isCorrect).length / totalQuestions) * 100) : accuracyRaw;

      if (!isStudent) {
          setLocalScoreResult({ score, accuracy: finalAccuracy, breakdown });
          (window as any)._worditFinishing = false;
          return;
      }

      sessionStorage.removeItem("activeGameRoom");
      sessionStorage.removeItem("activeGameId");

      try {
          // 🛠️ SINKRONISASI MUTLAK: Ambil response data kembalian dari database server WordIT
          const response = await finishGame(realGameId!, {
              scoreValue: score,
              maxScore: totalQuestions * 100,
              accuracy: finalAccuracy,
              timeSpent: 0,
              answersDetail: breakdown
          });

          // Ekstrak hasil perhitungan poin kecepatan (PTS/XP) resmi backend
          const savedScore = response?.data?.result?.scoreValue || response?.result?.scoreValue || score;
          const savedAccuracy = response?.data?.result?.accuracy || response?.result?.accuracy || finalAccuracy;

          (window as any)._worditFinishing = false;
          
          // Alihkan halaman membawa skor ter-sinkronisasi 1650 XP murni
          navigate("/student/result", {
              state: { score: Number(savedScore), accuracy: Number(savedAccuracy), breakdown }
          });
      } catch (e) {
          console.warn("Autosave gagal, menggunakan fallback local state.");
          (window as any)._worditFinishing = false;
          navigate("/student/result", {
              state: { score, accuracy: finalAccuracy, breakdown }
          });
      }
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

  const sortedLeaderboard = [...leaderboard].sort((a, b) => (b.score || 0) - (a.score || 0));
  const myRankIndex = sortedLeaderboard.findIndex(p => p.name === playerName);
  const myRank = myRankIndex !== -1 ? myRankIndex + 1 : "-";

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans relative overflow-hidden selection:bg-transparent">
      {showOverlay && (
        <RankingOverlay players={sortedLeaderboard.slice(0, 10)} currentPlayerName={playerName} />
      )}

      {showOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
           <div className="text-white font-black text-9xl opacity-10 animate-ping">{overlayCountdown}</div>
        </div>
      )}

      <div className="bg-slate-800/50 backdrop-blur-md px-8 py-4 flex justify-between items-center border-b border-white/5 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-white opacity-50 hover:opacity-100 transition-opacity text-xl">❮</button>
          <div>
            <h1 className="font-black text-white text-lg tracking-tight">{game?.title}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-indigo-400 text-[9px] font-black uppercase tracking-widest">
                {game?.templateType?.replace('_', ' ')}
              </span>
              {game?.recommendedDifficulty && (
                <span className="bg-indigo-500/20 text-indigo-300 text-[8px] font-black px-2 py-0.5 rounded-full border border-indigo-500/30 uppercase tracking-wider">
                  🧠 AI Diff: {game.recommendedDifficulty}
                </span>
              )}
            </div>
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

      {/* LOCAL SCORE OVERLAY FOR GUEST & TEACHER */}
      {localScoreResult && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 text-white w-full max-w-md rounded-[3rem] p-8 border border-white/10 text-center flex flex-col shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl"></div>
            
            <span className="text-6xl mb-4 block animate-bounce">🏆</span>
            <h2 className="text-3xl font-black tracking-tight leading-none mb-1">Game Selesai!</h2>
            <p className="text-indigo-400 text-xs font-black uppercase tracking-widest mb-6">Mode Demo / Latihan</p>
            
            <div className="bg-slate-700/50 border border-white/5 rounded-2xl p-6 mb-6 grid grid-cols-2 gap-4">
              <div>
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Skor Kamu</span>
                <span className="text-3xl font-black text-indigo-400">{localScoreResult.score}</span>
              </div>
              <div>
                <span className="block text-[10px] font-black text-slate-400 tracking-wider uppercase mb-1">Akurasi</span>
                <span className="text-3xl font-black text-emerald-400">{localScoreResult.accuracy}%</span>
              </div>
            </div>

            <div className="text-left text-xs text-slate-400 font-medium space-y-2 mb-8 bg-slate-900/40 p-4 rounded-2xl max-h-40 overflow-y-auto border border-white/5">
              <span className="block text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-2">Riwayat Jawaban:</span>
              {localScoreResult.breakdown.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-start py-1 border-b border-white/5 last:border-0 gap-2">
                  <span className="truncate flex-1 text-slate-300 font-semibold">
                    {item.question ? item.question : `Soal #${idx + 1}`}
                  </span>
                  <span className={`font-black uppercase text-[10px] px-2 py-0.5 rounded-full ${item.isCorrect ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                    {item.isCorrect ? 'Benar' : 'Salah'}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setLocalScoreResult(null);
                  navigate("/explore");
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-full uppercase tracking-wider text-xs transition-all shadow-lg shadow-indigo-500/20"
              >
                Kembali ke Eksplor
              </button>
              {!user && (
                <button
                  onClick={() => {
                    setLocalScoreResult(null);
                    navigate("/register");
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-full text-xs transition-all"
                >
                  Daftar Akun WordIT
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}