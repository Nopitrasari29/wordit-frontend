import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast"; 
import GameBuilderRouter from "../../../components/game/GameBuilderRouter";
import AIQuizGenerator from "../../../components/ai/AIQuizGenerator";

// 🚀 IMPORT UI COMPONENTS & SERVICES
import Button from "../../../components/ui/Button"; // Gunakan komponen yang sudah dibenahi
import { createGame } from "../../services/game.service";
import { TemplateType, EducationLevel, DifficultyLevel } from "../../../types/game";

export default function GameBuilderPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const template = (searchParams.get("template") as TemplateType) || TemplateType.ANAGRAM;
  const level = (searchParams.get("level") as EducationLevel) || EducationLevel.SMA;

  const [step, setStep] = useState(1);
  const [questionsFromAI, setQuestionsFromAI] = useState<any[]>([]);

  const [gamePayload, setGamePayload] = useState({
    title: "",
    gameItems: [] as any[]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAIFinished = (data: any[]) => {
    setQuestionsFromAI(data);
    setGamePayload(prev => ({ ...prev, gameItems: data }));
    setStep(2);
  };

  const handleEditorChange = (content: any) => {
    // Menangkap perubahan data dari editor kuis
    const items = Array.isArray(content) ? content : (content.words || content.cards || content.questions || []);
    setGamePayload((prev) => ({
      ...prev,
      gameItems: items
    }));
  };

  const handleSave = async (publishStatus: boolean) => {
    // 🔍 VALIDASI: Ini yang biasanya bikin tombol "seolah" nggak jalan
    if (!gamePayload.title.trim()) {
      return toast.error("Judul game jangan dikosongin ya, Nop! ✍️");
    }
    if (gamePayload.gameItems.length === 0) {
      return toast.error("Minimal ada 1 soal biar seru! 🧩");
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: gamePayload.title,
        templateType: template,
        educationLevel: level,
        difficulty: DifficultyLevel.MEDIUM,
        isPublished: publishStatus,
        gameJson: {
          template: template,
          // Sesuaikan key berdasarkan template agar engine game bisa baca
          ...(template === TemplateType.FLASHCARD 
              ? { cards: gamePayload.gameItems } 
              : [TemplateType.MAZE_CHASE, TemplateType.SPIN_THE_WHEEL].includes(template) 
                  ? { questions: gamePayload.gameItems } 
                  : { words: gamePayload.gameItems })
        }
      };

      await createGame(payload);
      
      toast.success(publishStatus ? "Game Berhasil Publish! 🚀" : "Draft Tersimpan! 💾");
      navigate("/teacher/dashboard");
    } catch (err: any) {
      console.error("Save Error:", err);
      toast.error(err.response?.data?.message || "Gagal menyimpan. Cek server Docker kamu!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-32 pt-28">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-6 mb-10">
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-indigo-600 text-white rounded-[1.8rem] flex items-center justify-center text-3xl shadow-lg">🛠️</div>
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight italic">Game Builder</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">{template}</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Level: <span className="text-indigo-600">{level}</span></span>
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
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            {/* Input Judul */}
            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-6 mb-2 block">Judul Aktivitas</label>
              <input
                type="text"
                placeholder="Misal: Kuis Sejarah Seru..."
                className="w-full bg-slate-50 border-2 border-transparent px-8 py-5 rounded-full focus:bg-white focus:border-indigo-500 outline-none font-black text-2xl text-slate-800 transition-all"
                value={gamePayload.title}
                onChange={(e) => setGamePayload({ ...gamePayload, title: e.target.value })}
              />
            </div>

            {/* Editor Game */}
            <div className="bg-white rounded-[3.5rem] p-8 md:p-14 shadow-2xl border border-slate-100">
              <GameBuilderRouter
                initialQuestions={questionsFromAI}
                value={gamePayload.gameItems}
                onChange={handleEditorChange}
              />
            </div>

            {/* 🔥 BOTTOM ACTION BAR (DIBENAHI) 🔥 */}
            <div className="sticky bottom-8 left-0 right-0 z-50 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-900 p-6 md:p-8 rounded-[3rem] border border-slate-800 shadow-2xl">
              <p className="text-slate-400 font-bold ml-4 hidden md:block italic text-sm">✨ Tips: Gunakan judul unik untuk setiap kuis.</p>
              
              <div className="flex items-center gap-4 w-full md:w-auto">
                {/* Pakai komponen Button kita biar rapi */}
                <Button 
                   onClick={() => handleSave(false)} 
                   disabled={isSubmitting}
                   className="bg-transparent text-slate-300 hover:text-white border-2 border-slate-700 hover:border-slate-500"
                >
                  SAVE DRAFT 💾
                </Button>
                
                <Button 
                   onClick={() => handleSave(true)} 
                   disabled={isSubmitting}
                   className="bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20"
                >
                  {isSubmitting ? "SIMPAN..." : "PUBLISH GAME 🚀"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}