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
  const [timeLeft, setTimeLeft] = useState(gameConfig?.timeLimit ? Number(gameConfig.timeLimit) : questions.length * 60);
  const [isFinished, setIsFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingFinal, setIsSavingFinal] = useState(false);

  const [history, setHistory] = useState<any[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");

  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "submitted" | "skipped"
  >("idle");
  const [charCount, setCharCount] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const historyRef = useRef<any[]>([]);
  const currentIndexRef = useRef(0);
  const scoreRef = useRef(0);
  const isSavingRef = useRef(false);
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

  const wordCount = useMemo(() => {
    const trimmed = currentAnswer.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
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

    const wordCount = answerToSubmit
      .split(/\s+/)
      .filter((w) => w.length > 1).length;
    let tempPoints = 0;
    if (wordCount >= 15) tempPoints = 100;
    else if (wordCount >= 10) tempPoints = 80;
    else if (wordCount >= 5) tempPoints = 60;
    else if (isAnswerMeaningful(answerToSubmit)) tempPoints = 40;

    const newScore = score + tempPoints;
    setScore(newScore);

    const answerRecord = {
      questionIndex: currentIndex,
      question: currentQ.question,
      selectedAnswer: answerToSubmit,
      pointsEarned: tempPoints,
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
      socket.emit("updateScore", {
          code: roomCode,
          score: newScore,
          accuracy: 0,
          progress: `${currentIndex + 1}/${questions.length}`,
      });
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
    if (isSavingRef.current) return;

    isSavingRef.current = true;
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
      accuracy: 0,
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
        sessionStorage.setItem("lastScore", String(finalResult.scoreValue || 0));
        sessionStorage.setItem("lastAccuracy", String(finalResult.accuracy || 0));
        sessionStorage.setItem("lastBreakdown", JSON.stringify(finalResult.answersDetail || []));

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
      <div className="p-10 text-center animate-pulse text-indigo-650 font-bold">
        Menyiapkan Essay... 🤖
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="min-h-[300px] flex flex-col items-center justify-center gap-6 p-20 text-center animate-fade-in w-full">
        <div className="relative">
          <div className="w-20 h-20 bg-indigo-50/80 rounded-full flex items-center justify-center border border-indigo-100 shadow-lg">
            <Loader2 className="animate-spin text-indigo-600" size={40} />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center text-xs animate-bounce border border-amber-300">
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
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;
  const timeWarning = timeLeft <= 30;

  return (
    <div className="flex flex-col items-center p-6 space-y-6 max-w-4xl mx-auto w-full font-sans select-none">
      {/* Play Instructions */}
      <div className="w-full bg-indigo-50/75 backdrop-blur-md border border-indigo-100 rounded-2xl p-4 text-center">
        <p className="text-xs font-bold text-indigo-950">
          📝 <span>Tuliskan jawaban penjelasanmu secara lengkap pada kolom input di bawah! AI akan melakukan penilaian kognitif.</span>
        </p>
      </div>

      {/* PROGRESS BAR */}
      <div className="w-full">
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden shadow-inner">
          <div
            className="h-2 bg-indigo-500 rounded-full transition-all duration-750"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">
          <span>
            Soal {currentIndex + 1} dari {questions.length}
          </span>
          <span>{Math.round(progressPercent)}% Selesai</span>
        </div>
      </div>

      {/* HEADER */}
      <div className="w-full flex justify-between bg-slate-900/95 backdrop-blur-md p-5 rounded-[2rem] border border-slate-800 text-white items-center gap-4 shadow-lg">
        <div className="flex flex-col font-black text-center min-w-[60px]">
          <span className="text-[9px] text-slate-400 uppercase tracking-widest mb-0.5">
            Soal
          </span>
          <span className="text-lg text-indigo-400">
            {currentIndex + 1}
            <span className="text-xs text-slate-500">
              {" "}
              / {questions.length}
            </span>
          </span>
        </div>

        <div
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full border ${timeWarning ? "text-rose-500 border-rose-500/20 bg-rose-500/10 animate-pulse" : "text-indigo-300 border-indigo-500/10 bg-indigo-500/5"}`}
        >
          <Clock
            size={16}
            className={timeWarning ? "text-rose-500 animate-pulse" : "text-indigo-400"}
          />
          <span className="text-base font-black">
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
          </span>
        </div>

        <div className="text-center flex flex-col font-black min-w-[60px]">
          <span className="text-[9px] text-slate-400 uppercase tracking-widest mb-0.5">
            Skor Sementara
          </span>
          <span className="text-indigo-400 text-lg">{score}</span>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="w-full bg-white p-6 md:p-10 rounded-[2.5rem] shadow-xl border border-indigo-50 flex flex-col gap-6">
        {/* Banner AI grading info */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl px-5 py-3.5 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-100/50 rounded-xl flex items-center justify-center shrink-0 border border-indigo-100">
            <Bot size={16} className="text-indigo-600 animate-pulse" />
          </div>
          <p className="text-xs font-bold text-indigo-850">
            Jawaban dinilai oleh AI setelah semua soal selesai. Tulis jawaban
            selengkap mungkin untuk skor terbaik.
          </p>
        </div>

        {/* Pertanyaan */}
        <div className="relative">
          <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Pertanyaan Essay
          </span>
          <h2 className="text-xl md:text-2xl font-black text-slate-800 leading-snug mt-3">
            {currentQ.question}
          </h2>
        </div>

        {/* Hint & Keywords */}
        {(currentQ.hint || (currentQ.keywords && currentQ.keywords.length > 0)) && (
          <div className="bg-amber-50/70 border border-amber-100 rounded-2xl px-5 py-4 space-y-2">
            {currentQ.hint && (
              <p className="text-xs font-bold text-amber-800">
                💡 {currentQ.hint}
              </p>
            )}
            {currentQ.keywords && currentQ.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest mr-1">
                  Kata Kunci:
                </span>
                {currentQ.keywords.map((kw: string, i: number) => (
                  <span
                    key={i}
                    className="text-[10px] font-black bg-amber-100/60 text-amber-800 px-2 py-0.5 rounded-lg border border-amber-200"
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
            className={`w-full h-52 bg-slate-50 border-2 rounded-2xl p-5 focus:bg-white outline-none resize-none font-bold text-slate-700 transition-all disabled:opacity-60 text-base leading-relaxed
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
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            {charCount > 0 && charCount < 15 && (
              <span className="text-[9px] font-black text-amber-500 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                Terlalu singkat
              </span>
            )}
            {charCount >= 15 && charCount < 50 && (
              <span className="text-[9px] font-black text-blue-500 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                Cukup
              </span>
            )}
            {charCount >= 50 && (
              <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                Bagus ✓
              </span>
            )}
            <span
              className={`text-[10px] font-black ${charCount < 15 && charCount > 0 ? "text-amber-400" : charCount >= 50 ? "text-emerald-500" : "text-slate-400"}`}
            >
              {wordCount} kata • {charCount} karakter
            </span>
          </div>
        </div>

        {/* Status setelah submit */}
        {submitStatus === "submitted" && (
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 animate-fade-in">
            <CheckCircle2 size={18} className="shrink-0" />
            <span className="text-xs font-bold">
              Jawaban diterima! AI akan menilai di akhir sesi.
            </span>
          </div>
        )}
        {submitStatus === "skipped" && (
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-50 text-slate-500 border border-slate-100 animate-fade-in">
            <AlertCircle size={18} className="shrink-0" />
            <span className="text-xs font-bold">
              Soal dilewati. Skor untuk soal ini: 0.
            </span>
          </div>
        )}

        {/* Tombol aksi */}
        <div className="flex justify-between items-center mt-1">
          <button
            onClick={handleSkip}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-650 font-black text-sm px-5 py-3 rounded-2xl hover:bg-slate-50 transition-all disabled:opacity-50 border border-transparent hover:border-slate-100"
          >
            Lewati →
          </button>

          <button
            onClick={handleAnswerSubmit}
            disabled={isSubmitting || currentAnswer.trim().length === 0}
            className={`flex items-center gap-3 px-6 py-3.5 rounded-full font-black text-sm transition-all active:scale-95 shadow-lg border
              ${
                isSubmitting
                  ? "bg-indigo-300 border-indigo-200 text-white cursor-not-allowed shadow-none"
                  : currentAnswer.trim().length === 0
                    ? "bg-slate-200 border-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                    : "bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-500 hover:shadow-indigo-500/20"
              }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Menyimpan...
              </>
            ) : (
              <>
                <Send size={16} /> Submit Jawaban
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
