import { useEffect, useState, useRef } from "react";
import Swal from "sweetalert2";
import { useParams, useNavigate } from "react-router-dom";
import GameRenderer from "../../components/game/GameRenderer";
import ErrorBoundary from "../../components/ui/ErrorBoundary";
import { getGameById, getGameByCode, finishGame, playGame } from "../services/game.service";
import socket from "../../hooks/useSocket";
import { toast } from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";

export default function PlayGamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  // State untuk local score (Guest & Teacher)
  const [localScoreResult, setLocalScoreResult] = useState<any>(null);

  const { user } = useAuth();
  const isStudent = user && user.role === "STUDENT";
  const [resolvedPlayerName, setResolvedPlayerName] = useState<string>(
    sessionStorage.getItem("playerName") || user?.name || "Player"
  );

  const isMounted = useRef(true);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      (window as any)._worditFinishing = false;
    };
  }, []);

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

        let activeName = resolvedPlayerName;
        // Jika kuis live lobi (memiliki shareCode) dan dimainkan oleh siswa
        if (finalData.shareCode && isStudent) {
          const formatRegex = /^[a-zA-Z0-9\s]+_.+/;
          if (!formatRegex.test(activeName)) {
            // Ganti window.prompt() dengan Swal modal agar tidak bisa di-bypass dengan Cancel
            let isValidName = false;
            let inputValue = user?.name ? `_${user.name}` : "";

            while (!isValidName) {
              const { value, isDismissed } = await Swal.fire({
                title: "Identitas Kelas Diperlukan",
                html: `
                  <p style="font-size:13px; color:#94a3b8; margin-bottom:12px;">
                    Masukkan dengan format: <strong style="color:#818cf8">Kelas_Nama</strong><br/>
                    <span style="font-size:11px;">Contoh: 7A_Budi atau 10IPA_Sari</span>
                  </p>
                `,
                input: "text",
                inputPlaceholder: "Contoh: 7A_BudiSantoso",
                inputValue,
                background: "#ffffff",
                color: "#1e293b",
                confirmButtonText: "Masuk ke Kuis ▶",
                allowOutsideClick: false,
                allowEscapeKey: false,
                inputAttributes: { autocapitalize: "off" },
                customClass: {
                  popup: "rounded-[2.5rem] border border-slate-100 shadow-2xl font-sans p-6",
                  title: "text-xl font-black text-slate-800 mt-2",
                  htmlContainer: "text-xs text-slate-400 font-medium",
                  confirmButton: "px-6 py-3.5 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-600 hover:bg-indigo-500 text-white mt-4 transition-all active:scale-95 shadow-md shadow-indigo-200 cursor-pointer",
                  input: "rounded-2xl border-2 border-slate-100 bg-white text-slate-700 px-4 py-3 text-sm mt-3 w-full outline-none focus:border-indigo-500 transition-all",
                },
                buttonsStyling: false,
                preConfirm: (val: string) => {
                  if (!val || !formatRegex.test(val.trim())) {
                    Swal.showValidationMessage("Format salah! Gunakan format: Kelas_Nama (Contoh: 7A_Budi)");
                    return false;
                  }
                  return val.trim();
                },
              });

              if (!isDismissed && value) {
                inputValue = value;
                isValidName = true;
                sessionStorage.setItem("playerName", value);
                setResolvedPlayerName(value);
                activeName = value;
              }
            }
          }
        }

        // 🧠 Panggil endpoint /play untuk start session game & dapatkan rekomendasi difficulty (Hanya untuk Student)
        if (isStudent) {
          try {
            const sessionData = await playGame(finalData.id || finalData._id, activeName);
            if (sessionData && sessionData.recommendedDifficulty) {
              finalData.recommendedDifficulty = sessionData.recommendedDifficulty;
            }
          } catch (playErr) {
            console.warn("⚠️ Gagal memulai sesi bermain (playGame):", playErr);
          }
        }

        setGame(finalData);
        startTimeRef.current = Date.now();
        if (finalData.shareCode) {
          socket.emit("joinGame", { code: finalData.shareCode, playerName: activeName, userId: user?.id });
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
  }, [gameId, navigate, isStudent, resolvedPlayerName]);

  useEffect(() => {
    const joinRoom = (shareCode: string) => {
      socket.emit("joinGame", { code: shareCode, playerName: resolvedPlayerName, userId: user?.id });
    };

    const handleGameFinished = (finalLeaderboard?: any[]) => {
      sessionStorage.removeItem("activeGameRoom");
      sessionStorage.removeItem("activeGameId");

      toast.error("Sesi telah berakhir.", { icon: "🛑" });

      const myPlayerName = resolvedPlayerName || sessionStorage.getItem("playerName") || user?.name || "";
      const myData = Array.isArray(finalLeaderboard)
        ? finalLeaderboard.find((p: any) => p.name === myPlayerName)
        : null;

      const finalScore = (myData?.score ?? Number(sessionStorage.getItem("lastScore"))) || 0;
      const finalAccuracy = (myData?.accuracy ?? Number(sessionStorage.getItem("lastAccuracy"))) || 0;

      sessionStorage.setItem("lastScore", finalScore.toString());
      sessionStorage.setItem("lastAccuracy", finalAccuracy.toString());

      if (isMounted.current) {
        navigate("/student/result", {
          state: {
            score: finalScore,
            accuracy: finalAccuracy,
            breakdown: myData?.answersDetail || JSON.parse(sessionStorage.getItem("lastBreakdown") || "[]"),
          },
        });
      }
    };

    const handleUpdatePlayerList = (newList: any[]) => {
      if (isMounted.current) {
        setLeaderboard(newList);
      }
    };

    const handlePlayerKicked = () => {
      toast.error("Anda telah dikeluarkan oleh guru.");
      if (isMounted.current) {
        navigate("/student/join");
      }
    };

    const handleHostDisconnected = () => {
      toast.error("Guru mengakhiri sesi.");
      if (isMounted.current) {
        navigate("/student/join");
      }
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
  }, [navigate, gameId, game, resolvedPlayerName]);

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

      const totalQuestions = game?.gameJson?.questions?.length || game?.gameJson?.words?.length || game?.gameJson?.pairs?.length || game?.gameJson?.cards?.length || 0;
      
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
          if (isMounted.current) {
              setLocalScoreResult({ score, accuracy: finalAccuracy, breakdown });
          }
          (window as any)._worditFinishing = false;
          return;
      }

      sessionStorage.removeItem("activeGameRoom");
      sessionStorage.removeItem("activeGameId");

      try {
          // Ambil maxScore dari game config (bukan hardcode)
          const gameContent = game?.gameJson && Array.isArray(game.gameJson) ? game.gameJson[0] : game?.gameJson;
          const configuredMaxScore = gameContent?.maxScore ? Number(gameContent.maxScore) : (totalQuestions * 100);

          const elapsedTimeSeconds = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));

          // 🛠️ SINKRONISASI MUTLAK: Ambil response data kembalian dari database server WordIT
          const response = await finishGame(realGameId!, {
              scoreValue: score,
              maxScore: configuredMaxScore,
              accuracy: finalAccuracy,
              timeSpent: elapsedTimeSeconds,
              answersDetail: breakdown
          });

          // Ekstrak hasil perhitungan poin resmi backend
          const savedScore = response?.result?.scoreValue ?? response?.data?.result?.scoreValue ?? score;
          const savedAccuracy = response?.result?.accuracy ?? response?.data?.result?.accuracy ?? finalAccuracy;
          // Gunakan breakdown dari backend (sudah ter-verifikasi dan berisi pointsEarned yang akurat)
          const savedBreakdown = response?.result?.answersDetail ?? response?.data?.result?.answersDetail ?? breakdown;

          (window as any)._worditFinishing = false;
          
          // Alihkan halaman membawa skor ter-sinkronisasi dari backend
          if (isMounted.current) {
              navigate("/student/result", {
                  state: { score: Number(savedScore), accuracy: Number(savedAccuracy), breakdown: savedBreakdown }
              });
          }
      } catch (e) {
          console.warn("Autosave gagal, menggunakan fallback local state.");
          (window as any)._worditFinishing = false;
          if (isMounted.current) {
              navigate("/student/result", {
                  state: { score, accuracy: finalAccuracy, breakdown }
              });
          }
      }
  };

  const handleBack = () => {
    if (isStudent) {
      Swal.fire({
        title: "Keluar dari Game?",
        text: "Skor dan progres Anda saat ini akan disimpan ke database.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#4f46e5",
        cancelButtonColor: "#334155",
        confirmButtonText: "Ya, Keluar!",
        cancelButtonText: "Batal",
        background: "#1e293b",
        color: "#ffffff",
        customClass: {
          popup: "rounded-[2.5rem] border border-slate-700 shadow-2xl font-sans p-6",
          title: "text-xl font-black text-white mt-2",
          htmlContainer: "text-xs text-slate-300 font-medium mb-4",
          confirmButton: "px-5 py-3 rounded-full text-xs font-black uppercase tracking-wider transition-all active:scale-95 mx-2 bg-indigo-600 text-white",
          cancelButton: "px-5 py-3 rounded-full text-xs font-black uppercase tracking-wider transition-all active:scale-95 mx-2 bg-slate-700 text-slate-300",
        },
        buttonsStyling: false,
      }).then((result) => {
        if (result.isConfirmed) {
          const currentScore = Number(sessionStorage.getItem("lastScore") || "0");
          const currentAccuracy = Number(sessionStorage.getItem("lastAccuracy") || "0");
          let breakdown = [];
          try {
            breakdown = JSON.parse(sessionStorage.getItem("lastBreakdown") || "[]");
          } catch {
            breakdown = [];
          }
          handleGameOver(currentScore, currentAccuracy, breakdown);
        }
      });
    } else {
      navigate(-1);
    }
  };

  // Instant next: tidak ada jeda antar soal, langsung lanjut
  const handleIntermission = () => {
    // Sengaja dikosongkan: perpindahan soal langsung tanpa jeda
    // Game engine akan otomatis lanjut ke soal berikutnya
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center font-sans">
      <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-6 text-indigo-400 font-black uppercase tracking-widest text-[10px]">Loading Arena...</p>
    </div>
  );

  const sortedLeaderboard = [...leaderboard].sort((a, b) => (b.score || 0) - (a.score || 0));
  const myRankIndex = sortedLeaderboard.findIndex(p => p.name === resolvedPlayerName);
  const myRank = myRankIndex !== -1 ? myRankIndex + 1 : "-";

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans relative overflow-hidden selection:bg-transparent">
      <div className="bg-slate-800/50 backdrop-blur-md px-8 py-4 flex justify-between items-center border-b border-white/5 z-10">
        <div className="flex items-center gap-4">
          <button onClick={handleBack} className="text-white opacity-50 hover:opacity-100 transition-opacity text-xl">❮</button>
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
            <ErrorBoundary>
              <GameRenderer
                templateType={String(game.templateType)}
                gameData={game}
                onIntermission={handleIntermission}
                // @ts-ignore
                onGameOver={handleGameOver}
              />
            </ErrorBoundary>
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