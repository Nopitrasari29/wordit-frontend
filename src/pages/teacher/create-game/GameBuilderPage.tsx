import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import GameBuilderRouter from "../../../components/game/GameBuilderRouter";
import AIQuizGenerator from "../../../components/ai/AIQuizGenerator";

// 🚀 IMPORT UI COMPONENTS & SERVICES
import Button from "../../../components/ui/Button";
import { createGame } from "../../services/game.service";
import { TemplateType, EducationLevel, DifficultyLevel } from "../../../types/game";

export default function GameBuilderPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const template = (searchParams.get("template") as TemplateType) || TemplateType.ANAGRAM;
  const level = (searchParams.get("level") as EducationLevel) || EducationLevel.SD;

  const [step, setStep] = useState(1);
  const [questionsFromAI, setQuestionsFromAI] = useState<any[]>([]);

  const [gamePayload, setGamePayload] = useState({
    title: "",
    words: [] as any[],     // Untuk Anagram, Hangman, WordSearch
    cards: [] as any[],     // Untuk Flashcard
    questions: [] as any[], // Untuk Maze Chase & Spin Wheel
    gridSize: 8
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔥 HANDLER 1: AI Generator Finished
  const handleAIFinished = (data: any) => {
    // Normalisasi data dari AI: ambil array dari property manapun yang tersedia
    const items = Array.isArray(data) ? data : (data.questions || data.words || data.cards || []);
    const gSize = data.gridSize || 8;

    setQuestionsFromAI(items);
    setGamePayload(prev => ({
      ...prev,
      words: items,
      cards: items,
      questions: items, // Isi semua agar builder mendeteksi data awal tanpa blank
      gridSize: gSize
    }));

    setStep(2);
    toast.success("Soal AI Berhasil Dimuat! ✨");
  };

  // 🔥 HANDLER 2: Builder Editor Change
  const handleEditorChange = (content: any) => {
    // Normalisasi content jika builder mengirim array satu lapis
    const dataObj = Array.isArray(content) ? content[0] : content;

    setGamePayload((prev) => ({
      ...prev,
      words: dataObj.words || prev.words,
      cards: dataObj.cards || prev.cards,
      questions: dataObj.questions || prev.questions,
      gridSize: dataObj.gridSize || prev.gridSize
    }));
  };

  // 🔥 HANDLER 3: Save to Backend
  const handleSave = async (publishStatus: boolean) => {
    if (!gamePayload.title.trim()) return toast.error("Judul game wajib diisi! ✍️");

    // Tentukan template mana yang butuh field 'questions'
    const isQuestionBased = [TemplateType.MAZE_CHASE, TemplateType.SPIN_THE_WHEEL].includes(template);

    const currentItems = isQuestionBased ? gamePayload.questions :
      template === TemplateType.FLASHCARD ? gamePayload.cards :
        gamePayload.words;

    if (currentItems.length === 0) {
      return toast.error("Minimal harus ada 1 soal! 🧩");
    }

    setIsSubmitting(true);
    try {
      // 📦 Persiapan Object gameJson
      const quizContent: any = { template: template };

      if (isQuestionBased) {
        // Format untuk Spin the Wheel & Maze Chase
        quizContent.questions = currentItems.map((item: any) => ({
          question: String(item.question || item.hint || "").trim(),
          answer: String(item.answer || item.word || item.correctAnswer || "").trim()
        })).filter(q => q.question !== "" && q.answer !== "");
      }
      else if (template === TemplateType.FLASHCARD) {
        // Format untuk Flashcard
        quizContent.cards = currentItems.map((item: any) => ({
          front: String(item.front || item.word || "").trim(),
          back: String(item.back || item.hint || "").trim()
        })).filter(c => c.front !== "");
      }
      else {
        // Format untuk Word Search, Anagram, Hangman
        quizContent.words = currentItems.map((item: any) => ({
          word: String(item.word || item.front || "").toUpperCase().replace(/[^A-Z]/g, ""),
          hint: String(item.hint || item.back || "Cari kata ini").trim()
        })).filter(w => w.word !== "");

        if (template === TemplateType.WORD_SEARCH) {
          quizContent.gridSize = Number(gamePayload.gridSize || 8);
        }
      }

      // 🎯 PAYLOAD FINAL: gameJson dikirim sebagai Object {} sesuai Zod Backend terbaru
      const finalPayload = {
        title: gamePayload.title.trim(),
        templateType: template,
        educationLevel: level,
        difficulty: DifficultyLevel.MEDIUM,
        isPublished: publishStatus,
        gameJson: quizContent
      };

      console.log("📤 SENDING PAYLOAD:", finalPayload);

      await createGame(finalPayload);

      toast.success(publishStatus ? "Game Berhasil Terbit! 🚀" : "Draft Disimpan! 💾");
      navigate("/teacher/dashboard");
    } catch (err: any) {
      console.error("❌ BACKEND ERROR:", err.response?.data);
      const msg = err.response?.data?.errors?.gameJson?.[0] || err.response?.data?.message;
      toast.error(msg || "Gagal menyimpan. Cek format data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-32 pt-28">
      <div className="max-w-7xl mx-auto px-6 mb-10">
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-indigo-600 text-white rounded-[1.8rem] flex items-center justify-center text-3xl shadow-lg">🛠️</div>
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight italic">Game Builder</h1>
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
            <button onClick={() => setStep(1)} className="text-indigo-600 font-black text-sm hover:underline transition-all">
              ← Kembali ke AI Generator
            </button>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 space-y-8">
        {step === 1 ? (
          <div className="animate-in fade-in duration-500">
            <AIQuizGenerator level={level} template={template} onFinish={handleAIFinished} />
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-6 mb-2 block"> Judul Aktivitas </label>
              <input
                type="text"
                placeholder="Misal: Kuis Spin Wheel Seru..."
                className="w-full bg-slate-50 border-2 border-transparent px-8 py-5 rounded-full focus:bg-white focus:border-indigo-500 outline-none font-black text-2xl text-slate-800 transition-all"
                value={gamePayload.title}
                onChange={(e) => setGamePayload({ ...gamePayload, title: e.target.value })}
              />
            </div>

            <div className="bg-white rounded-[3.5rem] p-8 md:p-14 shadow-2xl border border-slate-100 min-h-[400px]">
              <GameBuilderRouter
                initialQuestions={questionsFromAI}
                value={gamePayload}
                onChange={handleEditorChange}
              />
            </div>

            <div className="sticky bottom-8 left-0 right-0 z-50 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-900 p-6 md:p-8 rounded-[3rem] border border-slate-800 shadow-2xl mt-12">
              <p className="text-slate-400 font-bold ml-4 hidden md:block italic text-sm">✨ Tips: Spin Wheel sangat seru untuk menebak kata/istilah.</p>

              <div className="flex items-center gap-4 w-full md:w-auto">
                <Button
                  onClick={() => handleSave(false)}
                  disabled={isSubmitting}
                  className="bg-transparent text-slate-300 hover:text-white border-2 border-slate-700 hover:border-slate-500 flex-1 md:flex-none"
                >
                  SAVE DRAFT 💾
                </Button>

                <Button
                  onClick={() => handleSave(true)}
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20 flex-1 md:flex-none"
                >
                  {isSubmitting ? "MEMPROSES..." : "PUBLISH GAME 🚀"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}