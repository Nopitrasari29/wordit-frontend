import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { getGames } from "../../pages/services/game.service"; 
import { Game } from "../../types/game"; 
import GameCard from "./common/GameCard"; 
import Loader from "../ui/Loader";

export default function ExploreGamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        const data = await getGames(); 
        setGames(data);
      } catch (error: any) {
        toast.error("Gagal memuat daftar kuis. Silakan refresh.");
        console.error("Explore Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  return (
    <div className="space-y-12 font-sans pb-20">
      {/* 🌍 Hero Banner Section */}
      <div className="bg-indigo-600 rounded-[3rem] p-12 text-white shadow-2xl shadow-indigo-100 relative overflow-hidden group">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-5xl font-black mb-4 tracking-tight italic">
            Eksplor Game <span className="not-italic">🌍</span>
          </h1>
          <p className="text-indigo-100 font-bold text-lg leading-relaxed">
            Temukan ribuan kuis interaktif yang dirancang khusus untuk meningkatkan semangat belajar siswa.
          </p>
        </div>
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-white/10 rounded-full blur-[100px] group-hover:scale-110 transition-transform duration-700"></div>
      </div>

      {/* 🎮 Grid Daftar Game */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <Loader />
          <p className="text-slate-400 font-black animate-pulse uppercase tracking-widest text-xs">
            Menghubungkan ke Server...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {games.length > 0 ? (
            games.map((game) => (
              <div key={game.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* ✅ FIX: Ganti {...game} menjadi game={game} */}
                <GameCard game={game} />
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border-4 border-dashed border-slate-100">
              <div className="text-6xl mb-6 opacity-30">📭</div>
              <h3 className="text-xl font-black text-slate-400">Belum Ada Game Publik</h3>
            </div>
          )}
        </div>
      )}
    </div>
  );
}