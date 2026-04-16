import { useNavigate } from "react-router-dom";

const LEVELS = [
  { id: "SD", label: "Sekolah Dasar (SD)", icon: "🎒", color: "bg-orange-500" },
  { id: "SMP", label: "Sekolah Menengah (SMP)", icon: "🏫", color: "bg-blue-500" },
  { id: "SMA", label: "SMA / SMK", icon: "📚", color: "bg-emerald-500" },
  { id: "UNI", label: "Universitas / Umum", icon: "🎓", color: "bg-indigo-600" },
];

export default function ChooseLevelPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto py-20 px-6 font-sans">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-slate-800 mb-4">Pilih Jenjang Pendidikan 🎒</h1>
        <p className="text-slate-500 font-bold">Konten kuis akan disesuaikan dengan tingkat kesulitan jenjang ini.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {LEVELS.map((level) => (
          <button
            key={level.id}
            onClick={() => navigate(`/teacher/create/template?level=${level.id}`)}
            className="group bg-white p-8 rounded-[2.5rem] border-4 border-slate-100 hover:border-indigo-500 shadow-sm hover:shadow-2xl transition-all flex items-center gap-6 text-left"
          >
            <div className={`w-20 h-20 ${level.color} rounded-3xl flex items-center justify-center text-4xl shadow-lg group-hover:scale-110 transition-transform`}>
              {level.icon}
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-800">{level.label}</h3>
              <p className="text-slate-400 font-bold text-sm">Pilih tingkat ini ➔</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}