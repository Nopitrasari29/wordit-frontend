import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { toast } from "react-hot-toast";

export default function ChooseTemplatePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ambil level dari URL (misal: ?level=SD)
  const level = searchParams.get("level");

  useEffect(() => {
    const fetchTemplatesByLevel = async () => {
      if (!level) return;

      try {
        setLoading(true);
        // 📡 Memanggil API Backend: GET /api/games/templates/:level
        const response = await api.get(`/games/templates/${level}`);

        // Sesuaikan dengan struktur response backend-mu (biasanya response.data.data)
        setTemplates(response.data.data || response.data);
      } catch (error) {
        console.error("Gagal mengambil template:", error);
        toast.error("Gagal memuat daftar kuis 🌵");
      } finally {
        setLoading(false);
      }
    };

    fetchTemplatesByLevel();
  }, [level]);

  // Handler Navigasi Ganti Jenjang
  const handleGoBack = () => navigate("/teacher/create/level");

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center font-sans">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-black text-slate-400 uppercase tracking-widest text-xs">Menyusun Template...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-20 px-6 font-sans">
      <div className="flex justify-between items-end mb-12">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter">Pilih Template Game 🎮</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">
            Jenjang Terpilih: <span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full">{level}</span>
          </p>
        </div>
        <button
          onClick={handleGoBack}
          className="text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-indigo-600 transition-all"
        >
          ← Ganti Jenjang
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {templates.map((t: any) => (
          <button
            key={t.type}
            // Navigasi ke Builder dengan membawa template dan level
            onClick={() => navigate(`/teacher/create/builder?template=${t.type}&level=${level}`)}
            className="group bg-white p-10 rounded-[3.5rem] border-4 border-slate-100 hover:border-indigo-500 shadow-sm hover:shadow-2xl transition-all text-left relative overflow-hidden"
          >
            {/* Dekorasi nomor urut */}
            <span className="absolute -top-4 -right-4 text-9xl font-black text-slate-50 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity uppercase italic">
              {t.type}
            </span>

            <div className="text-5xl mb-8 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500">
              {/* Mapping Icon dinamis */}
              {t.type === 'FLASHCARD' && '🎴'}
              {t.type === 'ANAGRAM' && '🧩'}
              {t.type === 'HANGMAN' && '🧗'}
              {t.type === 'WORD_SEARCH' && '🔍'}
              {t.type === 'MAZE_CHASE' && '🏃'}
              {t.type === 'SPIN_THE_WHEEL' && '🎡'}
            </div>

            <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">{t.label}</h3>
            <p className="text-slate-400 font-bold text-sm leading-relaxed mb-8">{t.description}</p>

            <div className="bg-indigo-50 text-indigo-600 py-3 px-8 rounded-full inline-block font-black text-[10px] uppercase tracking-widest group-hover:bg-indigo-600 group-hover:text-white transition-all">
              Pilih Template →
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}