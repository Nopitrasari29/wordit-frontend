import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import GameBuilderRouter from "../../../components/game/GameBuilderRouter";
import AIQuizGenerator from "../../../components/ai/AIQuizGenerator";

export default function GameBuilderPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const template = searchParams.get("template") || "ANAGRAM";
  const level = searchParams.get("level") || "SD";

  const [step, setStep] = useState(1);
  const [questionsFromAI, setQuestionsFromAI] = useState<any[]>([]);

  const [gamePayload, setGamePayload] = useState({
    title: "",
    gameJson: { words: [] }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAIFinished = (data: any[]) => {
    setQuestionsFromAI(data);
    setStep(2);
  };

  const handleEditorChange = (content: any) => {
    setGamePayload((prev) => ({
      ...prev,
      gameJson: content
    }));
  };

  const handleSave = async (publishStatus: boolean) => {
    if (!gamePayload.title.trim()) return alert("Judul game wajib diisi!");

    setIsSubmitting(true);
    try {
      const response = await fetch("http://localhost:3000/api/games", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          title: gamePayload.title,
          templateType: template,
          educationLevel: level,
          difficulty: "MEDIUM",
          gameJson: gamePayload.gameJson,
          isPublished: publishStatus
        })
      });

      const res = await response.json();

      // PERBAIKAN LOGIC DISINI: 
      // Karena backend menggunakan helper successResponse, 
      // pastikan kita mengecek field 'success' dengan benar.
      if (response.ok || res.success === true) {
        alert(publishStatus ? "Game Berhasil Publish! 🚀" : "Draft Tersimpan! 💾");
        navigate("/teacher/projects");
      } else {
        if (res.message && res.message.includes("Unique constraint")) {
          alert("❌ Judul sudah ada. Gunakan judul yang berbeda!");
        } else {
          alert("Gagal menyimpan: " + (res.message || "Server Error"));
        }
      }
    } catch (err) {
      alert("Koneksi gagal. Pastikan Backend aktif.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-32">
      <div className="bg-white border-b border-slate-100 px-6 py-10 mb-10 shadow-sm pt-32">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-indigo-600 text-white rounded-[1.8rem] flex items-center justify-center text-3xl shadow-lg">
              🛠️
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">Game Builder</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                  {template.replace("_", " ")}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">
                  Level: <span className="text-indigo-600">{level}</span>
                </span>
              </div>
            </div>
          </div>
          {step === 2 && (
            <button onClick={() => setStep(1)} className="text-indigo-600 font-black text-sm hover:underline">
              ← Kembali ke AI Generator
            </button>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 space-y-8">
        {step === 1 ? (
          <AIQuizGenerator level={level} template={template} onFinish={handleAIFinished} />
        ) : (
          <div className="animate-fade-in-up space-y-8">
            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 relative overflow-hidden group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-6 mb-2 block">Judul Aktivitas</label>
              <input
                type="text"
                placeholder="Masukkan judul unik..."
                className="w-full bg-slate-50 border-2 border-transparent px-8 py-5 rounded-full focus:bg-white focus:border-indigo-500 outline-none font-black text-2xl text-slate-800 transition-all placeholder:text-slate-300"
                value={gamePayload.title}
                onChange={(e) => setGamePayload({ ...gamePayload, title: e.target.value })}
              />
            </div>

            <div className="bg-white rounded-[3.5rem] p-8 md:p-14 shadow-2xl border border-slate-100 relative">
              <GameBuilderRouter
                initialQuestions={questionsFromAI}
                value={gamePayload.gameJson}
                onChange={handleEditorChange}
              />
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-end items-center bg-slate-900 p-6 md:p-8 rounded-[3rem] border border-slate-800 shadow-2xl relative">
              <p className="mr-auto text-slate-400 font-bold ml-6 hidden md:block italic text-sm">
                ✨ Tips: Gunakan judul unik untuk setiap game.
              </p>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  onClick={() => handleSave(false)}
                  disabled={isSubmitting}
                  className="flex-1 md:flex-none px-10 py-4 rounded-full font-black text-slate-300 hover:text-white transition-all disabled:opacity-50 uppercase text-xs tracking-widest"
                >
                  Save Draft 💾
                </button>
                <button
                  onClick={() => handleSave(true)}
                  disabled={isSubmitting}
                  className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-500 text-white px-12 py-4 rounded-full font-black text-lg shadow-xl shadow-indigo-900/40 hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Publish Game 🚀"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}