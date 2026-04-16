import { useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

// DATA DUMMY TEMPLATE
const DUMMY_TEMPLATES = [
  { id: "ANAGRAM", name: "Anagram", icon: "🔠", desc: "Susun huruf menjadi kata yang benar." },
  { id: "FLASHCARDS", name: "Flashcards", icon: "🃏", desc: "Kartu interaktif untuk menghafal materi." },
  { id: "WORD_SEARCH", name: "Word Search", icon: "🔍", desc: "Temukan kata tersembunyi di dalam tabel." },
  { id: "MAZE_CHASE", name: "Maze Chase", icon: "🏃", desc: "Lari dari musuh sambil menjawab soal." },
];

export default function ChooseTemplatePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const level = searchParams.get("level") || "SD";

  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTemplates() {
      try {
        // Simulasi hit ke backend (Jika ada API, masukkan di sini)
        // const res = await fetch(`http://localhost:3000/api/templates?level=${level}`);
        // const data = await res.json();

        const data: any[] = []; // Anggap saja backend masih kosong/error

        if (data && data.length > 0) {
          setTemplates(data);
        } else {
          // PAKAI DUMMY JIKA BACKEND KOSONG
          setTemplates(DUMMY_TEMPLATES);
        }
      } catch (err) {
        setTemplates(DUMMY_TEMPLATES);
      } finally {
        setLoading(false);
      }
    }
    fetchTemplates();
  }, [level]);

  return (
    <div className="max-w-6xl mx-auto py-20 px-6 font-sans">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-800 mb-2">Pilih Template Game 🎮</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
            Jenjang Terpilih: <span className="text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{level}</span>
          </p>
        </div>
        <button onClick={() => navigate(-1)} className="text-slate-400 font-black hover:text-slate-800 transition-colors">
          ← Ganti Jenjang
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {templates.map((t) => (
          <div
            key={t.id}
            onClick={() => navigate(`/teacher/create/builder?template=${t.id}&level=${level}`)}
            className="bg-white p-8 rounded-[3rem] border-4 border-slate-50 hover:border-indigo-500 shadow-sm hover:shadow-2xl transition-all cursor-pointer group"
          >
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all">
              {t.icon}
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">{t.name}</h3>
            <p className="text-slate-400 font-semibold text-sm leading-relaxed mb-8">{t.desc}</p>
            <span className="bg-indigo-50 text-indigo-600 px-6 py-2 rounded-full font-black text-xs uppercase group-hover:bg-indigo-600 group-hover:text-white transition-all">
              Pilih Template ➔
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}