import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../../hooks/useSocket";
import { toast } from "react-hot-toast";

export default function GameLobbyPage() {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [players, setPlayers] = useState<string[]>([]);

    useEffect(() => {
        if (!sessionId) return;

        // 🎯 1. Ambil Nama dari Storage (Yang diisi di EnterPlayerPage)
        const savedName = sessionStorage.getItem("playerName") || "Guest Player";

        // 📡 2. JOIN LOBBY: Kirim objek lengkap { code, playerName }
        // Backend kamu (socket.ts) menunggu objek ini!
        socket.emit("joinLobby", { 
          code: sessionId, 
          playerName: savedName 
        });

        // 👥 3. LISTEN: Gunakan "updatePlayerList" agar sama dengan Backend & Host
        socket.on("updatePlayerList", (list: any[]) => {
            console.log("Daftar pemain terbaru:", list);
            // Karena list dari BE adalah array of object [{name, score}], kita ambil namanya saja
            const namesOnly = list.map(p => p.name);
            setPlayers(namesOnly);
        });

        // 🚀 4. AUTO-START: Pindah saat Guru klik Start
        socket.on("gameStarted", (gameId: string) => {
          toast.success("Game Dimulai! Siap-siap...");
          navigate(`/play/${gameId}`); 
        });

        // Cleanup agar tidak ada memory leak
        return () => {
          socket.off("updatePlayerList");
          socket.off("gameStarted");
        };
    }, [sessionId, navigate]);

    return (
        <div className="min-h-screen bg-indigo-900 flex flex-col relative overflow-hidden font-sans text-center">

            {/* Pattern Background Animasi */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent bg-[length:20px_20px]"></div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">

                {/* Loading Icon Animasi */}
                <div className="w-24 h-24 bg-white/20 rounded-[2.5rem] flex items-center justify-center text-5xl mb-8 animate-bounce border border-white/10 shadow-2xl">
                    ⏳
                </div>

                <div className="space-y-4 mb-12">
                  <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter drop-shadow-xl italic">
                      WAR <span className="text-blue-400">ROOM</span>
                  </h2>
                  <p className="text-indigo-200 text-lg font-bold uppercase tracking-[0.4em] opacity-80 italic">
                      Waiting for the teacher to start...
                  </p>
                </div>

                {/* Info Room & Counter */}
                <div className="flex flex-col items-center gap-4 mb-16">
                  <div className="bg-white/10 px-10 py-5 rounded-[2rem] border border-white/10 backdrop-blur-md shadow-2xl">
                      <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Room Code</p>
                      <span className="text-4xl font-black text-white font-mono tracking-widest uppercase">{sessionId}</span>
                  </div>
                  <div className="bg-emerald-500/20 text-emerald-400 px-6 py-2 rounded-full border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                    {players.length} Players Joined
                  </div>
                </div>

                {/* Player List (Bubbly Tags) */}
                <div className="flex flex-wrap justify-center gap-4 max-w-4xl">
                    {players.length === 0 ? (
                        <p className="text-white/20 font-black uppercase text-xs tracking-widest italic animate-pulse">
                          Searching for allies...
                        </p>
                    ) : (
                        players.map((name, i) => (
                            <div
                                key={i}
                                className="bg-white text-indigo-900 px-8 py-3 rounded-full text-lg font-black shadow-[0_8px_0_rgba(255,255,255,0.2)] hover:-translate-y-1 transition-all animate-fade-in uppercase italic"
                            >
                                {name}
                            </div>
                        ))
                    )}
                </div>

            </div>

            {/* Footer ITS */}
            <div className="py-8 opacity-20 z-10">
              <p className="text-white font-black text-[10px] uppercase tracking-[0.5em]">
                  ITS Surabaya • WordIT Engine v2.0
              </p>
            </div>
        </div>
    );
}