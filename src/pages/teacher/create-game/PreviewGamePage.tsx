import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GameRenderer from "../../../components/game/GameRenderer";
import { getGameById } from "../../services/game.service";
import { toast } from "react-hot-toast";

export default function PreviewGamePage() {
  const { gameId } = useParams();
  const navigate = useNavigate();

  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorDetail, setErrorDetail] = useState("");

  useEffect(() => {
    const fetchGameData = async () => {
      if (!gameId) {
        setErrorDetail("ID Game tidak ditemukan.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getGameById(gameId);
        const finalData = (response as any).data || response;

        if (!finalData) {
          throw new Error("Data kuis tidak ditemukan di server.");
        }

        setGame(finalData);
      } catch (err: any) {
        setErrorDetail(err.message || "Gagal memuat preview kuis.");
        toast.error("Gagal memuat data kuis. 🌵");
      } finally {
        setLoading(false);
      }
    };

    fetchGameData();
  }, [gameId]);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 font-sans">
        <div className="w-16 h-16 border-8 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-6 font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse text-[10px]">Menyiapkan Arena...</p>
      </div>
    );
  }

  if (errorDetail || !game) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-rose-50 p-6 text-center">
        <div className="text-8xl mb-6">🏜️</div>
        <h2 className="text-3xl font-black text-rose-600 uppercase tracking-tighter">Gagal Preview</h2>
        <p className="text-rose-400 font-bold mt-2 max-w-md text-sm">{errorDetail}</p>
        <button
          onClick={() => navigate("/teacher/projects")}
          className="mt-10 bg-rose-600 text-white px-10 py-4 rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all"
        >
          Kembali ke Projects
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20 font-sans">
      <div className="max-w-[1100px] mx-auto px-6 space-y-10">

        {/* 1. HEADER INFO */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                Preview Mode
              </span>
              <p className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.3em]">
                {game.templateType}
              </p>
            </div>
            <h1 className="text-5xl font-black text-slate-800 tracking-tighter italic leading-none">
              {game.title}
            </h1>
          </div>

          <button
            onClick={() => navigate(`/teacher/game/edit/${gameId}`)}
            className="hidden md:flex bg-white border-2 border-slate-200 text-slate-400 px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm gap-2 items-center"
          >
            Edit Kuis ✏️
          </button>
        </div>

        {/* 2. MAIN ACTIVITY CONTAINER */}
        <div className="relative group">
          <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-[5rem] opacity-5 blur-2xl group-hover:opacity-10 transition-opacity duration-700"></div>

          <div className="relative bg-white rounded-[4.5rem] shadow-2xl border-[14px] border-indigo-50 min-h-[600px] flex items-center justify-center overflow-hidden transition-all duration-500">
            <GameRenderer
              templateType={game.templateType}
              gameData={game}
            />
          </div>
        </div>

        {/* 3. CONTROL FOOTER (REVISI SESUAI FEEDBACK) */}
        <div className="bg-slate-900 p-8 md:p-12 rounded-[4rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

          <div className="relative z-10 text-center md:text-left">
            <h4 className="text-white font-black text-2xl italic tracking-tight">Kuis siap diterbitkan?</h4>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2 leading-relaxed">
              Pastikan semua soal sudah sesuai sebelum dibagikan ke siswa.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10 w-full md:w-auto">
            {/* TOMBOL EDIT REVISI (PENTING!) */}
            <button
              onClick={() => navigate(`/teacher/game/edit/${gameId}`)}
              className="w-full sm:w-auto bg-slate-800 text-slate-300 px-10 py-6 rounded-full font-black text-xs uppercase tracking-widest hover:bg-slate-700 hover:text-white transition-all border border-slate-700 shadow-xl"
            >
              Edit / Revisi 🛠️
            </button>

            <button
              onClick={() => navigate(`/play/${gameId}`)}
              className="w-full sm:w-auto bg-indigo-600 text-white px-16 py-6 rounded-full font-black text-xl hover:bg-indigo-500 hover:scale-105 shadow-2xl shadow-indigo-900/50 transition-all active:scale-95 flex items-center justify-center gap-3 border-b-4 border-indigo-800"
            >
              PUBLISH! 🚀
            </button>
          </div>
        </div>

        {/* 4. DISCLAIMER AI (FE-NEW-05) */}
        <div className="px-10 py-6 bg-amber-50/50 border-2 border-amber-100 rounded-[2.5rem] flex items-center gap-4">
          <span className="text-2xl">💡</span>
          <p className="text-amber-800 text-[10px] font-black uppercase tracking-widest leading-relaxed">
            Tips: Gunakan tombol <span className="text-amber-600">Revisi</span> jika hasil AI perlu disesuaikan dengan kurikulum kelas Anda.
          </p>
        </div>

      </div>
    </div>
  );
}