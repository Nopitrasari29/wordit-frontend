import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import GameBuilderRouter from "../../../components/game/GameBuilderRouter";
import AIQuizGenerator from "../../../components/ai/AIQuizGenerator";

// 🚀 IMPORT UI COMPONENTS & SERVICES
import Button from "../../../components/ui/Button";
import { createGame } from "../../services/game.service";
import {
  TemplateType,
  EducationLevel,
  DifficultyLevel,
} from "../../../types/game";

export default function GameBuilderPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const template =
    (searchParams.get("template") as TemplateType) || TemplateType.ANAGRAM;
  const level =
    (searchParams.get("level") as EducationLevel) || EducationLevel.SD;

  const [step, setStep] = useState(1);
  const [questionsFromAI, setQuestionsFromAI] = useState<any[]>([]);

  // 🔢 AI-05: State jumlah soal yang diminta user (strict count)
  const [questionCount, setQuestionCount] = useState(5);

  const [gamePayload, setGamePayload] = useState({
    title: "",
    words: [] as any[], // Untuk Anagram, Hangman, WordSearch
    cards: [] as any[], // Untuk Flashcard
    questions: [] as any[], // Untuk Maze Chase & Spin Wheel, Multiple Choice, True/False, Essay
    pairs: [] as any[], // Untuk Matching
    gridSize: 8,
    gradingMode: "AI",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // State untuk metadata baru
  const [classGrade, setClassGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [topic, setTopic] = useState("");
  const [timeLimit, setTimeLimit] = useState<number | "">(""); // Timer dalam detik
  const [maxScore, setMaxScore] = useState<number | "">(""); // Nilai Maksimum Kuis

  // Handle Buat Manual
  const handleManualCreate = () => {
    setQuestionsFromAI([]);
    setStep(2);
  };

  // 🔥 HANDLER 1: AI Generator Finished
  const handleAIFinished = (data: any) => {
    // Normalisasi data dari AI: ambil array dari property manapun yang tersedia
    const items = Array.isArray(data)
      ? data
      : data.questions || data.words || data.cards || data.pairs || [];
    const gSize = data.gridSize || 8;

    setQuestionsFromAI(items);
    setGamePayload((prev) => ({
      ...prev,
      words: items,
      cards: items,
      questions: items, // Isi semua agar builder mendeteksi data awal tanpa blank
      pairs: items, // Tambahkan pairs untuk Matching
      gridSize: gSize,
    }));

    setStep(2);
    toast.success("Soal AI Berhasil Dimuat! ✨");
  };

  // 🔥 HANDLER 2: Builder Editor Change
  const handleEditorChange = (content: any) => {
    // Normalisasi content jika builder mengirim array satu lapis
    const dataObj = Array.isArray(content) ? content[0] : content;

    setGamePayload((prev: any) => ({
      ...prev,
      words: dataObj.words || prev.words,
      cards: dataObj.cards || prev.cards,
      questions: dataObj.questions || prev.questions,
      pairs: dataObj.pairs || prev.pairs, // Tambahkan pairs
      gridSize: dataObj.gridSize || prev.gridSize,
      gradingMode: dataObj.gradingMode || prev.gradingMode,
    }));
  };

  // 🔥 HANDLER 3: Save to Backend
  const handleSave = async (publishStatus: boolean) => {

  console.log("PUBLISH STATUS:", publishStatus);
  console.log("TITLE:", gamePayload.title);
  console.log("CLASS:", classGrade);
  console.log("SUBJECT:", subject);

  // Tentukan kategori template untuk validasi dan format data
    const isQuestionBased = [
      TemplateType.MAZE_CHASE,
      TemplateType.SPIN_THE_WHEEL,
    ].includes(template);
    const isPassThrough = [
      TemplateType.MULTIPLE_CHOICE,
      TemplateType.TRUE_FALSE,
      TemplateType.MATCHING,
      TemplateType.ESSAY,
    ].includes(template);

    const currentItems = isPassThrough
      ? template === TemplateType.MATCHING
        ? gamePayload.pairs
        : gamePayload.questions
      : isQuestionBased
        ? gamePayload.questions
        : template === TemplateType.FLASHCARD
          ? gamePayload.cards
          : gamePayload.words;

    // Validasi hanya saat Publish
    if (publishStatus) {

      const titleValue = String(
        gamePayload.title || ""
      ).trim();

      const classValue = String(
        classGrade || ""
      ).trim();

      const subjectValue = String(
        subject || ""
      ).trim();

      console.log("TITLE CHECK:", titleValue);
      console.log("CLASS CHECK:", classValue);
      console.log("SUBJECT CHECK:", subjectValue);

      if (!gamePayload.title.trim()) {
        return toast.error(
          "Judul Aktivitas wajib diisi"
        );
      }

      if (!classGrade.trim()) {
        return toast.error(
          "Kelas / Grade wajib diisi"
        );
      }

      if (!subject.trim()) {
        return toast.error(
          "Mata Pelajaran wajib diisi"
        );
      }
    }

    setIsSubmitting(true);
    try {
      // 📦 Persiapan Object gameJson
      const quizContent: any = { template: template };

      if (isPassThrough) {
        if (template === TemplateType.MATCHING) {
          quizContent.pairs = currentItems;
        } else {
          quizContent.questions = currentItems;
        }
        if (template === TemplateType.ESSAY) {
          quizContent.gradingMode = (gamePayload as any).gradingMode || "AI";
        }
      } else if (isQuestionBased) {
        // Format untuk Spin the Wheel & Maze Chase
        quizContent.questions = currentItems
          .map((item: any) => ({
            question: String(item.question || item.hint || "").trim(),
            answer: String(
              item.answer || item.word || item.correctAnswer || "",
            ).trim(),
          }))
          .filter((q) => q.question !== "" && q.answer !== "");
      } else if (template === TemplateType.FLASHCARD) {
        // Format untuk Flashcard
        quizContent.cards = currentItems
          .map((item: any) => ({
            front: String(item.front || item.word || "").trim(),
            back: String(item.back || item.hint || "").trim(),
          }))
          .filter((c) => c.front !== "");
      } else {
        // Format untuk Word Search, Anagram, Hangman
        quizContent.words = currentItems
          .map((item: any) => ({
            word: String(item.word || item.front || "")
              .toUpperCase()
              .replace(/[^A-Z]/g, ""),
            hint: String(item.hint || item.back || "Cari kata ini").trim(),
          }))
          .filter((w) => w.word !== "");

        if (template === TemplateType.WORD_SEARCH) {
          quizContent.gridSize = Number(gamePayload.gridSize || 8);
        }
      }

      // 🎯 PAYLOAD FINAL: gameJson dikirim sebagai Object {} sesuai Zod Backend terbaru
      // Tambahkan konfigurasi tambahan ke dalam gameJson atau langsung ke root sesuai schema
      if (timeLimit) {
        quizContent.timeLimit = Number(timeLimit);
      }
      if (maxScore) {
        quizContent.maxScore = Number(maxScore);
      }

      const finalPayload = {
        title: gamePayload.title.trim(),
        templateType: template,
        educationLevel: level,
        difficulty: DifficultyLevel.MEDIUM,
        isPublished: publishStatus,
        classGrade: classGrade || undefined,
        subject: subject || undefined,
        chapter: chapter || undefined,
        topic: topic || undefined,
        gameJson: quizContent,
      };

      console.log("TITLE:", gamePayload.title);
      console.log("CLASS:", classGrade);
      console.log("SUBJECT:", subject);
      console.log("📤 SENDING PAYLOAD:", finalPayload);

      await createGame(finalPayload);

      toast.success(
        publishStatus ? "Game Berhasil Terbit! 🚀" : "Draft Disimpan! 💾",
      );
      navigate("/teacher/dashboard");
    } catch (err: any) {
      console.error("❌ BACKEND ERROR:", err.response?.data);

      const errors = err.response?.data?.errors;

      const msg =
        errors?.title?.[0] ||
        errors?.gameJson?.[0] ||
        err.response?.data?.message ||
        "Gagal menyimpan.";

      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-32 pt-28">
      <div className="max-w-7xl mx-auto px-6 mb-10">
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-indigo-600 text-white rounded-[1.8rem] flex items-center justify-center text-3xl shadow-lg">
              🛠️
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight italic">
                Game Builder
              </h1>
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
            <button
              onClick={() => setStep(1)}
              className="text-indigo-600 font-black text-sm hover:underline transition-all"
            >
              ← Kembali ke AI Generator
            </button>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 space-y-8">
        {step === 1 ? (
          <div className="animate-in fade-in duration-500">
            {/* 🔢 AI-05: Input jumlah soal sebelum generate — wire requestedCount ke AIQuizGenerator */}
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">
                  Jumlah Soal
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={questionCount}
                  onChange={(e) =>
                    setQuestionCount(
                      Math.max(1, Math.min(20, Number(e.target.value))),
                    )
                  }
                  className="w-24 bg-slate-50 border-2 border-transparent px-4 py-2 rounded-full focus:bg-white focus:border-indigo-500 outline-none font-black text-xl text-slate-800 text-center transition-all"
                />
                <span className="text-slate-400 text-sm font-bold">
                  soal (maks. 20)
                </span>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <AIQuizGenerator
                    level={level}
                    template={template}
                    onFinish={handleAIFinished}
                    requestedCount={questionCount}
                  />
                </div>
                
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-[2rem] md:w-1/3 bg-slate-50">
                  <p className="text-sm font-bold text-slate-500 mb-4 text-center">Atau buat kuis sendiri dari awal tanpa bantuan AI</p>
                  <Button 
                    onClick={handleManualCreate}
                    isFullWidth
                  >
                    ✏️ Buat Manual
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-6 mb-2 block">
                {" "}
                Judul Aktivitas{" "}
              </label>
              <input
                type="text"
                placeholder="Misal: Kuis Spin Wheel Seru..."
                className="w-full bg-slate-50 border-2 border-transparent px-8 py-5 rounded-full focus:bg-white focus:border-indigo-500 outline-none font-black text-2xl text-slate-800 transition-all mb-6"
                value={gamePayload.title}
                onChange={(e) =>
                  setGamePayload({ ...gamePayload, title: e.target.value })
                }
              />

              {/* Input Metadata Tambahan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-2">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Kelas / Grade</label>
                  <input type="text" placeholder="Misal: 7A, Kelas 10..." className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl focus:border-indigo-500 outline-none text-sm font-bold text-slate-700" value={classGrade} onChange={(e) => setClassGrade(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Mata Pelajaran</label>
                  <input type="text" placeholder="Misal: Biologi, Matematika..." className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl focus:border-indigo-500 outline-none text-sm font-bold text-slate-700" value={subject} onChange={(e) => setSubject(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Bab</label>
                  <input type="text" placeholder="Misal: Sistem Pencernaan..." className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl focus:border-indigo-500 outline-none text-sm font-bold text-slate-700" value={chapter} onChange={(e) => setChapter(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Topik Spesifik</label>
                  <input type="text" placeholder="Misal: Enzim Lambung..." className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl focus:border-indigo-500 outline-none text-sm font-bold text-slate-700" value={topic} onChange={(e) => setTopic(e.target.value)} />
                </div>
              </div>

              {/* Timer & Skor Maksimum */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 ml-2">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                    Waktu Pengerjaan / Timer (opsional)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={0}
                      placeholder="0"
                      className="w-24 bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl focus:border-indigo-500 outline-none text-sm font-bold text-slate-700 text-center"
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(e.target.value ? Number(e.target.value) : "")}
                    />
                    <span className="text-slate-500 text-sm font-bold">Detik</span>
                  </div>
                  <p className="text-rose-500 text-[10px] font-bold mt-1.5 leading-relaxed">
                    * Catatan: Ini adalah batas waktu total pengerjaan kuis keseluruhan, bukan batas waktu per soal.
                  </p>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                    Nilai Maksimum Kuis (opsional)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      placeholder="e.g. 500"
                      className="w-32 bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl focus:border-indigo-500 outline-none text-sm font-bold text-slate-700 text-center"
                      value={maxScore}
                      onChange={(e) => setMaxScore(e.target.value ? Number(e.target.value) : "")}
                    />
                    <span className="text-slate-500 text-sm font-bold">Poin</span>
                  </div>
                  <p className="text-slate-400 text-[10px] font-semibold mt-1.5 leading-relaxed">
                    Biarkan kosong untuk kalkulasi skor otomatis (default 100 poin per soal benar).
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[3.5rem] p-8 md:p-14 shadow-2xl border border-slate-100 min-h-[400px]">
              <GameBuilderRouter
                initialQuestions={questionsFromAI}
                value={gamePayload}
                onChange={handleEditorChange}
              />
            </div>

            <div className="sticky bottom-8 left-0 right-0 z-50 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-900 p-6 md:p-8 rounded-[3rem] border border-slate-800 shadow-2xl mt-12">
              <p className="text-slate-400 font-bold ml-4 hidden md:block italic text-sm">
                ✨ Tips: Spin Wheel sangat seru untuk menebak kata/istilah.
              </p>

              <div className="flex items-center gap-4 w-full md:w-auto">
                <Button
                  onClick={() => handleSave(false)}
                  disabled={isSubmitting}
                  className="bg-transparent text-slate-300 hover:text-white border-2 border-slate-700 hover:border-slate-500 flex-1 md:flex-none"
                >
                  SAVE DRAFT 💾
                </Button>

                <Button
                  onClick={() => {
                    console.log("🔥 PUBLISH CLICKED");
                    handleSave(true);
                  }}
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
