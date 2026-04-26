import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getGameById } from "../services/game.service";
import socket from "../../hooks/useSocket";
import { toast } from "react-hot-toast";

export default function HostSessionPage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [participants, setParticipants] = useState<any[]>([]);
  // 🎯 STATE: WAITING -> PLAYING -> ENDED
  const [sessionState, setSessionState] = useState<'WAITING' | 'PLAYING' | 'ENDED'>('WAITING');

  useEffect(() => {
    const fetchGameInfo = async () => {
      try {
        if (!gameId) return;
        const data = await getGameById(gameId);
        setGame(data);
      } catch (err) {
        toast.error("Gagal memuat data kuis untuk hosting.");
      } finally {
        setLoading(false);
      }
    };
    fetchGameInfo();
  }, [gameId]);

  useEffect(() => {
    if (!game?.shareCode) return;

    // 🎯 FIX: Pastikan Host join room dengan benar
    const joinAsHost = () => {
      console.log(`📡 [SOCKET] Host joining room: ${game.shareCode}`);
      socket.emit("hostJoin", game.shareCode);
    };

    if (socket.connected) {
      joinAsHost();
    } else {
      socket.on("connect", joinAsHost);
    }

    // 🎯 BE-13: Sinkronisasi Skor Real-time
    // Mendengarkan semua kemungkinan event update ranking dari backend
    const handleRankingUpdate = (newList: any[]) => {
      console.log("📊 [SOCKET] Data ranking diterima:", newList);
      // Validasi data adalah array untuk mencegah crash
      if (Array.isArray(newList)) {
        setParticipants(newList);
      }
    };

    socket.on("ranking_update", handleRankingUpdate);
    socket.on("updatePlayerList", handleRankingUpdate);
    socket.on("playerJoined", joinAsHost); // Re-join jika ada trigger pemain baru

    return () => {
      socket.off("connect", joinAsHost);
      socket.off("ranking_update", handleRankingUpdate);
      socket.off("updatePlayerList", handleRankingUpdate);
      socket.off("playerJoined", joinAsHost);
    };
  }, [game?.shareCode]);

  // 🎯 FUNGSI START GAME
  const handleStartGame = () => {
    if (participants.length === 0) {
      return toast.error("Belum ada pemain yang bergabung di arena. 🌵");
    }

    console.log(`🚀 [GAME] Memulai permainan di room: ${game?.shareCode}`);
    socket.emit("startGame", game?.shareCode);
    setSessionState('PLAYING');
    toast.success("Game Dimulai!");
  };

  // 🎯 FUNGSI END SESSION (STOP GAME)
  const handleEndSession = () => {
    if (window.confirm("Yakin ingin menghentikan permainan? Semua siswa akan dipaksa selesai.")) {
      console.log(`🛑 [GAME] Menghentikan permainan di room: ${game?.shareCode}`);
      socket.emit("finishGame", game?.shareCode);
      setSessionState('ENDED');
      toast.success("Game Dihentikan!");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-indigo-400 font-black tracking-widest animate-pulse">
      PREPARING HOST ARENA...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans overflow-hidden relative text-white">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]"></div>
      </div>

      {/* TOP BAR */}
      <div className="p-8 flex justify-between items-center z-10">
        <button
          onClick={() => {
            if (sessionState === 'PLAYING') {
              if (window.confirm("Game sedang berjalan! Akhiri sesi?")) {
                socket.emit("finishGame", game?.shareCode);
                navigate("/teacher/projects");
              }
            } else {
              navigate("/teacher/projects");
            }
          }}
          className="text-white/30 hover:text-white font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2"
        >
          ❮ Kembali
        </button>
        <div className="text-center">
          <h1 className="text-white font-black text-2xl italic tracking-tighter uppercase leading-none drop-shadow-lg">
            {game?.title || "Live Session"}
          </h1>
          <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2 italic">
            Host Mode Active
          </p>
        </div>
        <div className="w-24"></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-10 z-10 gap-12">

        {/* 🎫 TAMPILAN WAITING MODE */}
        {sessionState === 'WAITING' && (
          <div className="bg-white p-12 rounded-[4rem] shadow-[0_0_100px_rgba(79,70,229,0.3)] text-center border-[15px] border-indigo-50/50 transform hover:scale-105 transition-all duration-500">
            <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.3em] mb-4">Join at wordit.app with code:</p>
            <h2 className="text-9xl font-black text-slate-900 tracking-tighter leading-none italic uppercase">
              {game?.shareCode || "------"}
            </h2>
            <div className="mt-8 bg-indigo-50 py-3 px-10 rounded-full inline-block border border-indigo-100 shadow-inner">
              <span className="text-indigo-600 font-black text-xs uppercase tracking-widest animate-pulse">
                Waiting for players to join...
              </span>
            </div>
          </div>
        )}

        {/* 🎫 TAMPILAN LIVE/ENDED MODE */}
        {sessionState === 'PLAYING' && (
          <div className="text-center animate-fade-in">
            <div className="inline-block bg-rose-500 text-white px-8 py-3 rounded-full font-black text-2xl uppercase tracking-widest animate-pulse shadow-[0_0_50px_rgba(225,29,72,0.5)]">
              🔥 GAME IS LIVE 🔥
            </div>
          </div>
        )}

        {/* 🏆 LIVE RANKING (FE-16) */}
        <div className="w-full max-w-2xl bg-white/5 backdrop-blur-xl rounded-[3.5rem] p-10 border border-white/10 shadow-2xl relative">
          <div className="flex items-center justify-between mb-10 relative z-10 px-2">
            <div>
              <h3 className="text-white font-black text-xl uppercase italic tracking-tighter underline decoration-indigo-500 underline-offset-8">Live Ranking</h3>
              <p className="text-indigo-400/50 text-[8px] font-black uppercase tracking-[0.3em] mt-4">Real-time participation status</p>
            </div>
            <div className="text-right">
              <span className="bg-indigo-600 text-white px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                {participants.length} Participants
              </span>
            </div>
          </div>

          <div className="space-y-4 max-h-72 overflow-y-auto pr-2 custom-scrollbar relative z-10">
            {participants.length > 0 ? (
              [...participants].sort((a, b) => b.score - a.score).map((player, index) => (
                <div key={index} className="bg-white/5 p-6 rounded-[1.8rem] flex items-center justify-between border border-white/5 hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-5">
                    <span className={`w-10 h-10 flex items-center justify-center text-white font-black rounded-xl text-sm italic ${index === 0 ? 'bg-amber-500' : 'bg-indigo-600'}`}>
                      #{index + 1}
                    </span>
                    <span className="text-white font-black text-xl tracking-tight uppercase italic">{player.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-400 font-black text-3xl tracking-tighter">{player.score}</span>
                    <span className="text-indigo-300/30 font-black text-[10px] uppercase">pts</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 opacity-20 italic text-white uppercase font-black tracking-[0.5em]">
                Searching for challengers...
              </div>
            )}
          </div>

          {/* 🎯 TOMBOL DINAMIS */}
          {sessionState === 'WAITING' && (
            <button onClick={handleStartGame} className="w-full mt-12 bg-white text-indigo-600 py-6 rounded-[2.5rem] font-black text-2xl shadow-2xl hover:bg-indigo-50 transition-all active:scale-95 uppercase italic tracking-tighter">
              Start Game ▶️
            </button>
          )}

          {sessionState === 'PLAYING' && (
            <button onClick={handleEndSession} className="w-full mt-12 bg-rose-500 text-white py-6 rounded-[2.5rem] font-black text-2xl shadow-2xl hover:bg-rose-600 transition-all active:scale-95 uppercase italic tracking-tighter">
              🛑 Stop Game
            </button>
          )}

          {sessionState === 'ENDED' && (
            <button onClick={() => navigate("/teacher/projects")} className="w-full mt-12 bg-slate-700 text-white py-6 rounded-[2.5rem] font-black text-2xl shadow-2xl hover:bg-slate-600 transition-all active:scale-95 uppercase italic tracking-tighter">
              Tutup Papan Peringkat
            </button>
          )}
        </div>
      </div>
    </div>
  );
}