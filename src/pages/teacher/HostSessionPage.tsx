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
  
  // 🎯 State Peserta: Sekarang murni dikendalikan oleh Server
  const [participants, setParticipants] = useState<any[]>([]);

  // ================= TUGAS 1: AMBIL DATA KUIS =================
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

  // ================= TUGAS 2: SINKRONISASI SOCKET =================
  useEffect(() => {
    // 🎯 Cegah jalan kalau shareCode belum ada dari API
    if (!game?.shareCode) return;

    const joinAsHost = () => {
      console.log(`📡 [SOCKET] Mencoba join room: ${game.shareCode}`);
      socket.emit("hostJoin", game.shareCode);
    };

    // ⚡ PROTEKSI: Tunggu sampai socket beneran CONNECTED baru kirim hostJoin
    if (socket.connected) {
      joinAsHost();
    } else {
      socket.on("connect", joinAsHost);
    }

    // 👥 LISTEN: Menangkap data setiap ada siswa join/update
    socket.on("updatePlayerList", (newList: any[]) => {
      console.log("🔥 [REALTIME] Data Pemain Baru:", newList);
      setParticipants(newList); 
    });

    // 🧹 CLEANUP: Penting agar listener tidak menumpuk saat pindah page
    return () => {
      socket.off("connect", joinAsHost);
      socket.off("updatePlayerList");
    };
  }, [game?.shareCode]); // Trigger ulang saat shareCode siap

  // ================= FUNGSI START GAME =================
  const handleStartGame = () => {
    if (participants.length === 0) {
      return toast.error("Belum ada pemain yang join di arena, Nop! 🌵");
    }
    
    // Beritahu server untuk memindahkan semua siswa ke PlayGamePage
    console.log(`🚀 [GAME] Memulai permainan di room: ${game?.shareCode}`);
    socket.emit("startGame", game?.shareCode);
    toast.success("Game Dimulai!");
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-indigo-400 font-black tracking-widest animate-pulse">
      PREPARING HOST ARENA...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans overflow-hidden relative">
      
      {/* Background Glow Effect */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]"></div>
      </div>

      {/* TOP BAR */}
      <div className="p-8 flex justify-between items-center z-10">
        <button 
          onClick={() => navigate("/teacher/dashboard")}
          className="text-white/30 hover:text-white font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2"
        >
          ❮ End Session
        </button>
        <div className="text-center">
          <h1 className="text-white font-black text-2xl italic tracking-tighter uppercase leading-none drop-shadow-lg">
            {game?.title || "Live Session"}
          </h1>
          <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2 italic">Host Mode Active</p>
        </div>
        <div className="w-24"></div>
      </div>

      {/* MAIN CONTENT: JOIN INFO & LEADERBOARD */}
      <div className="flex-1 flex flex-col items-center justify-center p-10 z-10 gap-12">
        
        {/* 🎫 JOIN CODE CARD */}
        <div className="bg-white p-12 rounded-[4rem] shadow-[0_0_100px_rgba(79,70,229,0.3)] text-center transform hover:scale-105 transition-all duration-500 border-[15px] border-indigo-50/50">
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

        {/* 🏆 LIVE RANKING (Beneran Real-Time) */}
        <div className="w-full max-w-2xl bg-white/5 backdrop-blur-xl rounded-[3.5rem] p-10 border border-white/10 shadow-2xl overflow-hidden relative">
          <div className="flex items-center justify-between mb-10 relative z-10 px-2">
            <div>
               <h3 className="text-white font-black text-xl uppercase italic tracking-tighter underline decoration-indigo-500 underline-offset-8">Live Ranking</h3>
               <p className="text-indigo-400/50 text-[8px] font-black uppercase tracking-[0.3em] mt-4">Real-time participation status</p>
            </div>
            <div className="text-right">
                <span className="bg-indigo-600 text-white px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-900/50">
                {participants.length} Participants
                </span>
            </div>
          </div>

          <div className="space-y-4 max-h-72 overflow-y-auto pr-2 custom-scrollbar relative z-10">
            {participants.length > 0 ? (
              participants.map((player, index) => (
                <div 
                  key={index} 
                  className="bg-white/5 hover:bg-white/10 p-6 rounded-[1.8rem] flex items-center justify-between transition-all border border-white/5 animate-fade-in group"
                >
                  <div className="flex items-center gap-5">
                    <span className="w-10 h-10 flex items-center justify-center bg-indigo-600 text-white font-black rounded-xl text-sm italic shadow-lg group-hover:scale-110 transition-transform">
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
              <div className="text-center py-20 opacity-20 italic text-white text-sm uppercase font-black tracking-[0.5em] animate-pulse">
                Searching for challengers...
              </div>
            )}
          </div>

          <button 
            onClick={handleStartGame}
            className="w-full mt-12 bg-white text-indigo-600 py-6 rounded-[2.5rem] font-black text-2xl shadow-2xl hover:bg-indigo-50 transition-all active:scale-95 uppercase italic tracking-tighter shadow-indigo-900/20"
          >
              Start Game ▶️
          </button>
        </div>
      </div>

    </div>
  );
}