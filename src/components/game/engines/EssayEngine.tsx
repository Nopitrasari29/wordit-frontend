import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { submitAnswer, finishGame } from "../../../pages/services/game.service";
import socket from "../../../hooks/useSocket";
import { toast } from "react-hot-toast";
import {
  Bot,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";

export default function EssayEngine({
  data,
  onGameOver,
  onIntermission,
}: {
  data: any;
  onGameOver?: any;
  onIntermission?: () => void;
}) {
  const navigate = useNavigate();
  const realGameId = data?.id || data?._id;
  const roomCode = data?.shareCode || "";

  useEffect(() => {
    console.log("🧠 ESSAY RAW DATA:", data);
  }, [data]);

  const gameConfig = useMemo(() => {
    if (Array.isArray(data?.gameJson)) return data.gameJson[0];
    if (data?.gameJson) return data.gameJson;
    if (data?.data?.questions) return data.data;
    if (data?.questions) return data;
    return null;
  }, [data]);

  const questions = useMemo(() => {
    return (
      gameConfig?.questions || data?.questions || data?.data?.questions || []
    );
  }, [gameConfig, data]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(questions.length * 60);
  const [isFinished, setIsFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingFinal, setIsSavingFinal] = useState(false);

  const [history, setHistory] = useState<any[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");

  // State untuk feedback sementara saat submit tiap soal
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "submitted" | "skipped"
  >("idle");
  const [charCount, setCharCount] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const historyRef = useRef<any[]>([]);
  const currentIndexRef = useRef(0);
  const scoreRef = useRef(0);
  const isFinishedRef = useRef(false);

  useEffect(() => {
    historyRef.current = history;
  }, [history]);
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);
  useEffect(() => {
    setCharCount(currentAnswer.length);
  }, [currentAnswer]);

  useEffect(() => {
    if (questions.length === 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          if (!isFinishedRef.current) handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
      setTotalTimeSpent((prev) => prev + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [questions]);

  const handleTimeUp = () => {
    if (isFinishedRef.current) return;
    toast.error("Waktu Habis! ⏰");

    const currentHist = historyRef.current;
    const currentIdx = currentIndexRef.current;
    const currentScore = scoreRef.current;
    const completeHistory = [...currentHist];

    if (completeHistory.length <= currentIdx) {
      completeHistory.push({
        questionIndex: currentIdx,
        question: questions[currentIdx]?.question || "",
        selectedAnswer: "",
        pointsEarned: 0,
      });
    }

    for (let i = completeHistory.length; i < questions.length; i++) {
      completeHistory.push({
        questionIndex: i,
        question: questions[i]?.question || "",
        selectedAnswer: "",
        pointsEarned: 0,
      });
    }

    handleFinish(completeHistory, currentScore);
  };

  // Validasi panjang minimum jawaban bermakna (sinkron dengan pre-check backend)
  const isAnswerMeaningful = (answer: string) => answer.trim().length >= 15;

  const handleAnswerSubmit = async () => {
    if (isFinished || isSubmitting) return;

    const answerToSubmit = currentAnswer.trim();

    if (!answerToSubmit) {
      toast.error("Jawaban tidak boleh kosong.");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    const currentQ = questions[currentIndex];

    // Skor sementara untuk UI real-time (akan di-override hasil AI di akhir)
    // Lebih presisi: berbasis panjang + kata bermakna
    const wordCount = answerToSubmit
      .split(/\s+/)
      .filter((w) => w.length > 1).length;
    let tempPoints = 0;
    if (wordCount >= 10) tempPoints = 60;
    else if (wordCount >= 5) tempPoints = 40;
    else if (isAnswerMeaningful(answerToSubmit)) tempPoints = 20;

    const newScore = score + tempPoints;
    setScore(newScore);

    const answerRecord = {
      questionIndex: currentIndex,
      question: currentQ.question,
      selectedAnswer: answerToSubmit,
      pointsEarned: tempPoints, // akan di-override AI di akhir
    };

    const newHistory = [...history, answerRecord];
    setHistory(newHistory);
    setSubmitStatus("submitted");

    if (!isAnswerMeaningful(answerToSubmit)) {
      toast(
        "Jawaban sangat singkat. AI kemungkinan akan memberi skor rendah. 💡",
        { icon: "⚠️" },
      );
    } else {
      toast.success("Jawaban diterima! AI akan menilai di akhir 🤖");
    }

    if (roomCode)
      socket.emit("updateScore", { code: roomCode, score: newScore });
    submitAnswer(realGameId, currentIndex, answerToSubmit, newScore).catch(
      () => {},
    );

    setTimeout(() => {
      setCurrentAnswer("");
      setSubmitStatus("idle");
      setIsSubmitting(false);

      if (currentIndex + 1 < questions.length) {
        if (onIntermission) onIntermission();
        setCurrentIndex(currentIndex + 1);
      } else {
        handleFinish(newHistory, newScore);
      }
    }, 1500);
  };

  const handleSkip = () => {
    if (isSubmitting) return;

    const currentQ = questions[currentIndex];
    const skipRecord = {
      questionIndex: currentIndex,
      question: currentQ.question,
      selectedAnswer: "",
      pointsEarned: 0,
    };
    const newHistory = [...history, skipRecord];
    setHistory(newHistory);
    setCurrentAnswer("");
    setSubmitStatus("skipped");

    setTimeout(() => {
      setSubmitStatus("idle");
      if (currentIndex + 1 < questions.length) {
        if (onIntermission) onIntermission();
        setCurrentIndex(currentIndex + 1);
      } else {
        handleFinish(newHistory, score);
      }
    }, 600);
  };

  const handleFinish = async (finalHistory: any[], finalScore: number) => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;
    setIsFinished(true);
    setIsSavingFinal(true);
    if (timerRef.current) clearInterval(timerRef.current);

    let completeHistory = [...finalHistory];
    if (completeHistory.length < questions.length) {
      for (let i = completeHistory.length; i < questions.length; i++) {
        completeHistory.push({
          questionIndex: i,
          question: questions[i]?.question || "",
          selectedAnswer: "",
          pointsEarned: 0,
        });
      }
    }

    const maxPossiblePoints = questions.length * 100;

    const payload = {
      scoreValue: finalScore,
      maxScore: maxPossiblePoints,
      accuracy: 0, // backend hitung ulang dari hasil AI
      timeSpent: totalTimeSpent,
      answersDetail: completeHistory,
    };

    sessionStorage.setItem("lastScore", finalScore.toString());
    sessionStorage.setItem("lastAccuracy", "0");
    sessionStorage.setItem("lastBreakdown", JSON.stringify(completeHistory));

    try {
      const finishResponse = await finishGame(realGameId, payload);
      console.log("🔥 FINISH RESPONSE:", finishResponse);

      const finalResult = finishResponse?.result;

      if (finalResult) {
        sessionStorage.setItem(
          "lastScore",
          String(finalResult.scoreValue || 0),
        );
        sessionStorage.setItem(
          "lastAccuracy",
          String(finalResult.accuracy || 0),
        );
        sessionStorage.setItem(
          "lastBreakdown",
          JSON.stringify(finalResult.answersDetail || []),
        );

        if (onGameOver) {
          onGameOver(
            finalResult.scoreValue || 0,
            finalResult.accuracy || 0,
            finalResult.answersDetail || [],
          );
        } else {
          navigate("/student/result", {
            state: {
              scoreValue: finalResult.scoreValue || 0,
              accuracy: finalResult.accuracy || 0,
              answersDetail: finalResult.answersDetail || [],
            },
          });
        }
        return;
      }
    } catch (e) {
      console.error("❌ FINISH GAME ERROR:", e);
    }

    if (onGameOver) onGameOver(finalScore, 0, payload.answersDetail);
    else navigate("/student/result", { state: payload });
  };

  if (questions.length === 0) {
    return (
      <div className="p-10 text-center animate-pulse">
        Menyiapkan Essay... 🤖
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="min-h-[300px] flex flex-col items-center justify-center gap-6 p-20 text-center animate-fade-in">
        <div className="relative">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
            <Loader2 className="animate-spin text-indigo-600" size={40} />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center text-xs animate-bounce">
            🤖
          </div>
        </div>
        <div>
          <p className="font-black text-indigo-600 text-xl animate-pulse">
            {isSavingFinal
              ? "AI sedang menilai jawabanmu..."
              : "Menyimpan hasil..."}
          </p>
          <p className="text-slate-400 text-sm font-bold mt-2">
            Mohon tunggu, jangan tutup halaman ini ✨
          </p>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const progressPercent = (currentIndex / questions.length) * 100;
  const timeWarning = timeLeft <= 30;

  return (
    <div className="flex flex-col items-center p-4 md:p-6 space-y-5 max-w-4xl mx-auto w-full font-sans">
      {/* PROGRESS BAR */}
      <div className="w-full">
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="h-2 bg-indigo-500 rounded-full transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <span>
            Soal {currentIndex + 1} dari {questions.length}
          </span>
          <span>{Math.round(progressPercent)}% Selesai</span>
        </div>
      </div>

      {/* HEADER */}
      <div className="w-full flex justify-between bg-white p-4 md:p-5 rounded-[2rem] shadow-sm border-2 border-indigo-50 items-center gap-4">
        <div className="flex flex-col font-black text-center min-w-[60px]">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest">
            Soal
          </span>
          <span className="text-xl text-indigo-600">
            {currentIndex + 1}
            <span className="text-sm text-slate-300">
              {" "}
              / {questions.length}
            </span>
          </span>
        </div>

        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl ${timeWarning ? "bg-rose-50 border border-rose-200" : "bg-slate-50"}`}
        >
          <Clock
            size={16}
            className={
              timeWarning ? "text-rose-500 animate-pulse" : "text-slate-400"
            }
          />
          <span
            className={`text-xl font-black ${timeWarning ? "text-rose-500 animate-pulse" : "text-slate-700"}`}
          >
            {Math.floor(timeLeft / 60)}:
            {(timeLeft % 60).toString().padStart(2, "0")}
          </span>
        </div>

        <div className="text-center flex flex-col font-black min-w-[60px]">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest">
            Sementara
          </span>
          <span className="text-indigo-600 text-xl">{score}</span>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="w-full bg-white p-6 md:p-10 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col gap-6">
        {/* Banner AI grading info */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl px-5 py-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
            <Bot size={16} className="text-indigo-600" />
          </div>
          <p className="text-xs font-bold text-indigo-700">
            Jawaban dinilai oleh AI setelah semua soal selesai. Tulis jawaban
            selengkap mungkin untuk skor terbaik.
          </p>
        </div>

        {/* Pertanyaan */}
        <div>
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">
            Pertanyaan Essay
          </span>
          <h2 className="text-xl md:text-2xl font-black text-slate-800 leading-tight mt-4">
            {currentQ.question}
          </h2>
        </div>

        {/* Hint & Keywords jika ada */}
        {(currentQ.hint ||
          (currentQ.keywords && currentQ.keywords.length > 0)) && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4 space-y-2">
            {currentQ.hint && (
              <p className="text-sm font-bold text-amber-700">
                💡 {currentQ.hint}
              </p>
            )}
            {currentQ.keywords && currentQ.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest mr-1">
                  Kata Kunci:
                </span>
                {currentQ.keywords.map((kw: string, i: number) => (
                  <span
                    key={i}
                    className="text-[10px] font-black bg-amber-100 text-amber-700 px-2 py-1 rounded-lg border border-amber-200"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Textarea jawaban */}
        <div className="relative">
          <textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            disabled={isSubmitting}
            placeholder="Ketik jawaban penjelasanmu di sini dengan lengkap dan jelas..."
            className={`w-full h-52 bg-slate-50 border-2 rounded-[2rem] p-6 focus:bg-white outline-none resize-none font-bold text-slate-700 transition-all disabled:opacity-60 text-base leading-relaxed
                            ${
                              submitStatus === "submitted"
                                ? "border-emerald-400 bg-emerald-50"
                                : submitStatus === "skipped"
                                  ? "border-slate-300"
                                  : charCount > 0 && charCount < 15
                                    ? "border-amber-300 focus:border-amber-400"
                                    : "border-slate-200 focus:border-indigo-400"
                            }`}
          />

          {/* Character counter dengan indikator kualitas */}
          <div className="absolute bottom-5 right-5 flex items-center gap-2">
            {charCount > 0 && charCount < 15 && (
              <span className="text-[10px] font-black text-amber-500 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                Terlalu singkat
              </span>
            )}
            {charCount >= 15 && charCount < 50 && (
              <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200">
                Cukup
              </span>
            )}
            {charCount >= 50 && (
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                Bagus ✓
              </span>
            )}
            <span
              className={`text-xs font-black ${charCount < 15 && charCount > 0 ? "text-amber-400" : charCount >= 50 ? "text-emerald-500" : "text-slate-400"}`}
            >
              {charCount} karakter
            </span>
          </div>
        </div>

        {/* Status setelah submit */}
        {submitStatus === "submitted" && (
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 animate-fade-in">
            <CheckCircle2 size={18} className="shrink-0" />
            <span className="text-sm font-bold">
              Jawaban diterima! AI akan menilai di akhir sesi.
            </span>
          </div>
        )}
        {submitStatus === "skipped" && (
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-50 text-slate-500 border border-slate-100 animate-fade-in">
            <AlertCircle size={18} className="shrink-0" />
            <span className="text-sm font-bold">
              Soal dilewati. Skor untuk soal ini: 0.
            </span>
          </div>
        )}

        {/* Tombol aksi */}
        <div className="flex justify-between items-center mt-1">
          <button
            onClick={handleSkip}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-600 font-black text-sm px-5 py-3 rounded-2xl hover:bg-slate-100 transition-all disabled:opacity-50"
          >
            Lewati →
          </button>

          <button
            onClick={handleAnswerSubmit}
            disabled={isSubmitting || currentAnswer.trim().length === 0}
            className={`flex items-center gap-3 px-8 py-4 rounded-full font-black text-base transition-all active:scale-95 shadow-lg
                            ${
                              isSubmitting
                                ? "bg-indigo-300 text-white cursor-not-allowed shadow-none"
                                : currentAnswer.trim().length === 0
                                  ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                                  : "bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-indigo-500/40"
                            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Menyimpan...
              </>
            ) : (
              <>
                <Send size={18} /> Submit Jawaban
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
