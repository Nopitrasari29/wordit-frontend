import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GameRenderer from "../../../components/game/GameRenderer";
import { getGameById } from "../../services/game.service";
import { toast } from "react-hot-toast";

export default function PreviewGamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();

  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorDetail, setErrorDetail] = useState("");

  useEffect(() => {
    const fetchGameData = async () => {
      if (!gameId) return;
      try {
        setLoading(true);
        const data = await getGameById(gameId) as any;

        console.log("🔥 DEBUG PREVIEW DATA:", data);

        if (!data || !data.gameJson) {
          throw new Error("Data kuis tidak ditemukan atau rusak.");
        }
        setGame(data);
      } catch (err: any) {
        console.error("Preview Fetch Error:", err);
        const errMsg = err.response?.data?.message || err.message || "Gagal memuat kuis.";
        setErrorDetail(errMsg);
        toast.error("Gagal memuat preview. 🌵");
      } finally {
        setLoading(false);
      }
    };
    fetchGameData();
  }, [gameId]);

  if (loading) return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50">
      <div className="w-16 h-16 border-8 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-6 font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse text-[10px]">Menyiapkan Arena...</p>
    </div>
  );

  if (errorDetail || !game) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-rose-50 p-6 text-center">
      <div className="text-8xl mb-6">🏜️</div>
      <h2 className="text-3xl font-black text-rose-600 uppercase tracking-tighter">Gagal Preview</h2>
      <p className="text-rose-400 font-bold mt-2 max-w-md text-sm">{errorDetail}</p>
      <button onClick={() => navigate("/teacher/projects")} className="mt-10 bg-rose-600 text-white px-10 py-4 rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl">Kembali ke Projects</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20 font-sans px-6">
      <div className="max-w-[1100px] mx-auto space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Preview Mode</span>
              <p className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.3em]">{game.templateType}</p>
            </div>
            <h1 className="text-5xl font-black text-slate-800 tracking-tighter italic leading-none">{game.title}</h1>
          </div>
          <button
            onClick={() => navigate(`/teacher/game/edit/${gameId}`)}
            className="bg-white border-2 border-slate-200 text-slate-400 px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm flex items-center gap-2"
          >
            Edit Kuis ✏️
          </button>
        </div>

        <div className="relative bg-white rounded-[4.5rem] shadow-2xl border-[14px] border-indigo-50 min-h-[600px] flex items-center justify-center overflow-hidden transition-all duration-500">
          <GameRenderer templateType={game.templateType} gameData={game} />
        </div>

        <div className="bg-slate-900 p-10 rounded-[4rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <h4 className="text-white font-black text-2xl italic tracking-tight">Kuis siap diterbitkan?</h4>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Pastikan semua soal sudah sesuai sebelum dibagikan ke siswa.</p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => navigate(`/teacher/game/edit/${gameId}`)} className="bg-slate-800 text-slate-300 px-10 py-5 rounded-full font-black text-xs uppercase tracking-widest hover:text-white border border-slate-700 shadow-xl">Revisi 🛠️</button>
            <button onClick={() => navigate(`/teacher/projects`)} className="bg-indigo-600 text-white px-16 py-5 rounded-full font-black text-xl hover:bg-indigo-500 shadow-2xl transition-all">PUBLISH! 🚀</button>
          </div>
        </div>
      </div>
    </div>
  );
}