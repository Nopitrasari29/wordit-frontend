import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { submitAnswer, finishGame } from "../../../pages/services/game.service";
import socket from "../../../hooks/useSocket";
import { toast } from "react-hot-toast";
import { X, Check } from "lucide-react";

interface GameAnswer {
  questionIndex: number;
  question: string;
  selectedAnswer: boolean | null;
  correctAnswer: string;
  isCorrect: boolean;
  displaySelected?: string;
}

export default function TrueFalseEngine({
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

  const gameConfig = useMemo(
    () => (Array.isArray(data?.gameJson) ? data.gameJson[0] : data?.gameJson),
    [data]
  );
  const questions = useMemo(() => gameConfig?.questions || [], [gameConfig]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(gameConfig?.timeLimit ? Number(gameConfig.timeLimit) : questions.length * 10);
  const [isFinished, setIsFinished] = useState(false);
  const isSavingRef = useRef(false);

  const historyRef = useRef<any[]>([]);
  const scoreRef = useRef(0);

  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);

  // Timer Logic
  useEffect(() => {
    if (questions.length === 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeUp();
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
    toast.error("Waktu Habis! ⏰");
    handleFinish(historyRef.current, scoreRef.current);
  };

  const handleAnswer = (answerChoice: boolean) => {
    if (swipeDirection || isFinished) return;

    const currentQ = questions[currentIndex];
    const isCorrect = answerChoice === currentQ.correctAnswer;

    setSwipeDirection(answerChoice ? "right" : "left");

    const maxScoreConfig = Number(gameConfig?.maxScore);
    const pointsPerQuestion = maxScoreConfig && maxScoreConfig > 0 && questions.length > 0
      ? Math.round(maxScoreConfig / questions.length)
      : 100;
    const pointsEarned = isCorrect ? pointsPerQuestion : 0;
    const newScore = score + pointsEarned;

    setScore(newScore);
    scoreRef.current = newScore;

    const answerRecord = {
      questionIndex: currentIndex,
      selectedAnswer: answerChoice,
      isCorrect,
    };
    historyRef.current = [...historyRef.current, answerRecord];

    if (isCorrect) toast.success("Tepat Sekali! 🎉");
    else toast.error("Oops, Salah! ❌");

    if (roomCode) {
      const correctCount = historyRef.current.filter((h: any) => h.isCorrect).length;
      const accuracy = Math.round((correctCount / historyRef.current.length) * 100);
      const progress = `${currentIndex + 1}/${questions.length}`;
      socket.emit("updateScore", { code: roomCode, score: newScore, accuracy, progress });
    }
    submitAnswer(realGameId, currentIndex, String(answerChoice), newScore).catch(() => {});

    setTimeout(() => {
      setSwipeDirection(null);
      if (currentIndex + 1 < questions.length) {
        if (onIntermission) onIntermission();
        setCurrentIndex(currentIndex + 1);
      } else {
        handleFinish(historyRef.current, newScore);
      }
    }, 500);
  };

  const handleFinish = async (finalHistory: any[], finalScore: number) => {
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    if (isFinished) return;
    setIsFinished(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const completeHistory: GameAnswer[] = questions.map(
      (q: any, index: number) => {
        const historyItem = finalHistory.find((h) => h.questionIndex === index);
        const correctLabel = q.correctAnswer === true ? "Benar" : "Salah";

        if (historyItem) {
          return {
            questionIndex: index,
            question: q.question,
            selectedAnswer: historyItem.selectedAnswer,
            displaySelected: historyItem.selectedAnswer === true ? "Benar" : "Salah",
            correctAnswer: correctLabel,
            isCorrect: historyItem.isCorrect,
          };
        }

        return {
          questionIndex: index,
          question: q.question,
          selectedAnswer: null,
          displaySelected: "(Tidak dijawab)",
          correctAnswer: correctLabel,
          isCorrect: false,
        };
      }
    );

    const correctCount = completeHistory.filter((h: GameAnswer) => h.isCorrect).length;
    const realAccuracy = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

    const payload = {
      scoreValue: finalScore,
      maxScore: Number(gameConfig?.maxScore) || questions.length * 100,
      accuracy: realAccuracy,
      timeSpent: totalTimeSpent,
      answersDetail: completeHistory,
    };

    sessionStorage.setItem("lastScore", finalScore.toString());
    sessionStorage.setItem("lastAccuracy", realAccuracy.toString());
    sessionStorage.setItem("lastBreakdown", JSON.stringify(completeHistory));

    if (onGameOver) {
        onGameOver(finalScore, realAccuracy, completeHistory);
        return;
    }

    try {
        await finishGame(realGameId, payload);
    } catch (e) {
        console.error("Gagal simpan skor ke DB");
    }

    navigate("/student/result", {
        state: {
            ...payload,
            accuracy: realAccuracy,
        },
    });
  };

  if (questions.length === 0)
    return (
      <div className="p-10 text-center text-slate-400 font-bold animate-pulse">
        Menyiapkan kartu... 🃏
      </div>
    );
  if (isFinished)
    return (
      <div className="p-20 text-center font-black animate-pulse uppercase tracking-widest text-indigo-600">
        Menyimpan Skor... 🏆
      </div>
    );

  const currentQ = questions[currentIndex];

  let cardAnimationClass = "transition-transform duration-500 ease-out";
  if (swipeDirection === "left") {
    cardAnimationClass += " -translate-x-[150%] -rotate-12 opacity-0";
  } else if (swipeDirection === "right") {
    cardAnimationClass += " translate-x-[150%] rotate-12 opacity-0";
  } else {
    cardAnimationClass += " translate-x-0 rotate-0 opacity-100 scale-100";
  }

  return (
    <div className="flex flex-col items-center p-6 space-y-6 max-w-2xl mx-auto font-sans w-full select-none">
      {/* Play Instructions */}
      <div className="w-full bg-indigo-50/75 backdrop-blur-md border border-indigo-100 rounded-2xl p-4 text-center">
        <p className="text-xs font-bold text-indigo-950">
          💡 <span>Tentukan apakah pernyataan berikut Benar (geser kanan) atau Salah (geser kiri)!</span>
        </p>
      </div>

      {/* HEADER (Stats) */}
      <div className="w-full flex justify-between bg-slate-900/95 backdrop-blur-md p-5 rounded-[2rem] border border-slate-800 text-white items-center shadow-lg">
        <div className="flex flex-col font-black text-center">
          <span className="text-[9px] text-slate-400 uppercase tracking-widest mb-0.5">Soal</span>
          <span className="text-indigo-400 italic text-lg">
            {currentIndex + 1}{" "}
            <span className="text-xs text-slate-500">/ {questions.length}</span>
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[9px] text-slate-400 uppercase tracking-widest text-center mb-0.5">Sisa Waktu</span>
          <span className={`text-xl font-black px-4 py-0.5 rounded-full border ${timeLeft <= 5 ? "text-rose-500 border-rose-500/20 bg-rose-500/10 animate-pulse" : "text-indigo-300 border-indigo-500/10 bg-indigo-500/5"}`}>
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
          </span>
        </div>
        <div className="text-center flex flex-col font-black">
          <span className="text-[9px] text-slate-400 uppercase tracking-widest mb-0.5">Skor</span>
          <span className="text-indigo-400 text-xl">{score}</span>
        </div>
      </div>

      {/* CARD ARENA */}
      <div className="w-full flex items-center justify-center relative [perspective:1000px] py-4">
        {currentIndex + 1 < questions.length && (
          <div className="absolute w-[95%] h-[230px] bg-slate-100 rounded-[2.5rem] border border-slate-200 scale-95 translate-y-6 -z-10 shadow-inner"></div>
        )}

        <div
          className={`w-full min-h-[220px] max-h-[340px] bg-white p-8 rounded-[2.5rem] shadow-2xl border-2 border-indigo-50 flex items-center justify-center text-center relative overflow-hidden origin-bottom ${cardAnimationClass}`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

          <div className="relative z-10 w-full max-h-[260px] overflow-y-auto">
            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full mb-3 inline-block">Pernyataan</span>
            <h2 className="text-xl md:text-2xl font-black text-slate-800 leading-snug break-words px-4">
              "{currentQ.question}"
            </h2>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS (Tinder Style) */}
      <div className="flex gap-8 w-full justify-center py-2">
        {/* SALAH (False) */}
        <button
          disabled={swipeDirection !== null}
          onClick={() => handleAnswer(false)}
          className="w-20 h-20 bg-white border-2 border-rose-200 text-rose-500 hover:bg-rose-500 hover:text-white hover:border-rose-500 rounded-full flex flex-col items-center justify-center hover:scale-105 active:scale-95 shadow-lg shadow-rose-500/5 hover:shadow-rose-500/25 transition-all disabled:opacity-50"
        >
          <X size={28} strokeWidth={4} />
          <span className="font-black text-[9px] uppercase tracking-widest mt-1">Salah</span>
        </button>

        {/* BENAR (True) */}
        <button
          disabled={swipeDirection !== null}
          onClick={() => handleAnswer(true)}
          className="w-20 h-20 bg-white border-2 border-emerald-200 text-emerald-500 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 rounded-full flex flex-col items-center justify-center hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/5 hover:shadow-emerald-500/25 transition-all disabled:opacity-50"
        >
          <Check size={28} strokeWidth={4} />
          <span className="font-black text-[9px] uppercase tracking-widest mt-1">Benar</span>
        </button>
      </div>
    </div>
  );
}
