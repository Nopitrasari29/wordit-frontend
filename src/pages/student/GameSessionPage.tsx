import { useEffect, useState } from "react";
import {
  useParams,
  useNavigate,
} from "react-router-dom";

import socket from "../../hooks/useSocket";
import { getGameById } from "../services/game.service";
import { toast } from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";

import GameRenderer from "../../components/game/GameRenderer";

export default function GameSessionPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [game, setGame] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    let isMounted = true;

    const playerName =
      sessionStorage.getItem("playerName") ||
      user?.name ||
      "Guest Player";

    const joinGameRoom = () => {
      socket.emit("joinGame", {
        code: sessionId,
        playerName,
        userId: user?.id,
      });

      console.log(
        "🎮 Join Game Room:",
        sessionId,
        playerName,
        user?.id,
      );
    };

    const loadGame = async () => {
      try {
        const data = await getGameById(sessionId);

        if (!isMounted) return;

        setGame(data);

        joinGameRoom();
      } catch (err) {
        console.error(
          "❌ Gagal memuat sesi game:",
          err,
        );

        if (!isMounted) return;

        setError(true);
      }
    };

    loadGame();

    /**
     * ============================
     * SOCKET EVENTS
     * ============================
     */

    const handleReconnect = () => {
      console.log(
        "🔄 Socket reconnect - rejoining room...",
      );

      joinGameRoom();
    };

    const handlePlayerKicked = () => {
      toast.error("Anda telah dikeluarkan dari permainan oleh guru.");
      navigate("/student/join");
    };

    const handleHostDisconnected = () => {
      toast.error("Guru mengakhiri sesi permainan.");
      navigate("/student/join");
    };

    const handleGameFinished = (
      finalLeaderboard: any[],
    ) => {
      console.log(
        "🏁 Game Finished",
        finalLeaderboard,
      );

      navigate("/student/result");
    };

    socket.on("connect", handleReconnect);

    socket.on(
      "playerKicked",
      handlePlayerKicked,
    );

    socket.on(
      "hostDisconnected",
      handleHostDisconnected,
    );

    socket.on(
      "gameFinished",
      handleGameFinished,
    );

    /**
     * CLEANUP
     */
    return () => {
      isMounted = false;

      socket.off(
        "connect",
        handleReconnect,
      );

      socket.off(
        "playerKicked",
        handlePlayerKicked,
      );

      socket.off(
        "hostDisconnected",
        handleHostDisconnected,
      );

      socket.off(
        "gameFinished",
        handleGameFinished,
      );
    };
  }, [sessionId, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-rose-50 p-6 text-center">
        <div className="text-6xl mb-4">
          🏜️
        </div>

        <h2 className="text-2xl font-black text-rose-600 uppercase italic">
          Sesi Tidak Ditemukan
        </h2>

        <p className="text-rose-400 font-bold max-w-xs mt-2">
          Pastikan ID Game benar atau kuis
          sudah dipublikasikan.
        </p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-16 h-16 border-8 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>

        <p className="mt-4 font-black text-indigo-600 animate-pulse uppercase tracking-widest text-[10px]">
          Menyiapkan Sesi Game...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-2xl">
            🎮
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              Game Session
            </h2>

            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Aktivitas: {game.title}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden border-[8px] border-white min-h-[600px] flex items-center justify-center relative">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none"></div>

          <GameRenderer
            templateType={game.templateType}
            gameData={game}
          />
        </div>
      </div>
    </div>
  );
}