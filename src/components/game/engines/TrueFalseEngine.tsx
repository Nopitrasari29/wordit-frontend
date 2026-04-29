import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { submitAnswer, finishGame } from "../../../pages/services/game.service";
import socket from "../../../hooks/useSocket";
import { toast } from "react-hot-toast";
import { X, Check } from "lucide-react";

export default function TrueFalseEngine({ data, onGameOver, onIntermission }: { data: any, onGameOver?: any, onIntermission?: () => void }) {
    const navigate = useNavigate();
    const realGameId = data?.id || data?._id;
    const roomCode = data?.shareCode || "";

    // 🧠 Parsing Data
    const gameConfig = useMemo(() => Array.isArray(data?.gameJson) ? data.gameJson[0] : data?.gameJson, [data]);
    const questions = useMemo(() => gameConfig?.questions || [], [gameConfig]);

    // 🎮 Game State
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(questions.length * 10); // 10 detik per soal (lebih cepat krn cuma baca)
    const [isFinished, setIsFinished] = useState(false);
    const [history, setHistory] = useState<any[]>([]);

    // Animasi State ("left", "right", atau null)
    const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [totalTimeSpent, setTotalTimeSpent] = useState(0);

    // ⏱️ Timer Logic
    useEffect(() => {
        if (questions.length === 0) return;

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    handleTimeUp();
                    return 0;
                }
                return prev - 1;
            });
            setTotalTimeSpent(prev => prev + 1);
        }, 1000);

        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [questions]);

    const handleTimeUp = () => {
        toast.error("Waktu Habis! ⏰");
        handleFinish(history);
    };

    const handleAnswer = (answerChoice: boolean) => {
        if (swipeDirection || isFinished) return; // Cegah klik dobel

        const currentQ = questions[currentIndex];
        const isCorrect = answerChoice === currentQ.correctAnswer;

        // Trigger Animasi (Benar/Kanan, Salah/Kiri)
        setSwipeDirection(answerChoice ? "right" : "left");

        // Kalkulasi Skor (Skor True/False agak kecil karena 50:50)
        const newScore = score + (isCorrect ? 50 : 0);
        if (isCorrect) setScore(newScore);

        // Catat Riwayat
        const answerRecord = {
            questionIndex: currentIndex,
            selectedAnswer: answerChoice,
            isCorrect
        };
        const newHistory = [...history, answerRecord];
        setHistory(newHistory);

        // Feedback Instan
        if (isCorrect) toast.success("Tepat Sekali! 🎉");
        else toast.error("Oops, Salah! ❌");

        // 🚀 Realtime Update
        if (roomCode) socket.emit("updateScore", { code: roomCode, score: newScore });
        submitAnswer(realGameId, currentIndex, String(answerChoice), newScore).catch(() => { });

        // Tunggu kartu terbang (500ms), lalu reset dan ganti soal
        setTimeout(() => {
            setSwipeDirection(null);
            if (currentIndex + 1 < questions.length) {
                if (onIntermission) onIntermission();
                setCurrentIndex(currentIndex + 1);
            } else {
                handleFinish(newHistory, newScore);
            }
        }, 500);
    };

    const handleFinish = async (finalHistory: any[], finalScore = score) => {
        if (isFinished) return;
        setIsFinished(true);
        if (timerRef.current) clearInterval(timerRef.current);

        // QA 5.B Bug Fix: History anti-bolong
        let completeHistory = [...finalHistory];
        if (completeHistory.length < questions.length) {
            for (let i = completeHistory.length; i < questions.length; i++) {
                completeHistory.push({
                    questionIndex: i,
                    selectedAnswer: null,
                    isCorrect: false
                });
            }
        }

        const correctCount = completeHistory.filter(h => h.isCorrect).length;
        const accuracy = Math.round((correctCount / questions.length) * 100);

        const payload = {
            scoreValue: finalScore,
            maxScore: questions.length * 50, // 50 poin per soal
            accuracy,
            timeSpent: totalTimeSpent,
            answersDetail: completeHistory,
        };

        sessionStorage.setItem("lastScore", finalScore.toString());
        sessionStorage.setItem("lastAccuracy", accuracy.toString());
        sessionStorage.setItem("lastBreakdown", JSON.stringify(payload.answersDetail));

        try {
            await finishGame(realGameId, payload);
        } catch (e) {
            console.error("Gagal simpan skor ke DB");
        }

        if (onGameOver) {
            onGameOver(finalScore, accuracy, payload.answersDetail);
        } else {
            navigate("/student/result", { state: payload });
        }
    };

    if (questions.length === 0) return <div className="p-10 text-center text-slate-400 font-bold animate-pulse">Menyiapkan kartu... 🃏</div>;
    if (isFinished) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-widest text-indigo-600">Menyimpan Skor... 🏆</div>;

    const currentQ = questions[currentIndex];

    // Logika class untuk animasi swipe
    let cardAnimationClass = "transition-transform duration-500 ease-out";
    if (swipeDirection === "left") {
        cardAnimationClass += " -translate-x-[150%] -rotate-12 opacity-0";
    } else if (swipeDirection === "right") {
        cardAnimationClass += " translate-x-[150%] rotate-12 opacity-0";
    } else {
        cardAnimationClass += " translate-x-0 rotate-0 opacity-100 scale-100";
    }

    return (
        <div className="flex flex-col items-center p-4 md:p-6 space-y-6 max-w-2xl mx-auto font-sans w-full min-h-[80vh] justify-between">

            {/* HEADER (Stats) */}
            <div className="w-full flex justify-between bg-white p-4 rounded-[2rem] shadow-sm border-2 border-indigo-50 items-center">
                <div className="flex flex-col font-black text-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">Kartu</span>
                    <span className="text-xl text-indigo-600">{currentIndex + 1} <span className="text-sm text-slate-300">/ {questions.length}</span></span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">Sisa Waktu</span>
                    <span className={`text-2xl font-black ${timeLeft <= 5 ? 'text-rose-500 animate-pulse' : 'text-slate-700'}`}>
                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </span>
                </div>
                <div className="text-center flex flex-col font-black">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">Skor</span>
                    <span className="text-indigo-600 text-2xl">{score}</span>
                </div>
            </div>

            {/* CARD ARENA */}
            <div className="flex-1 w-full flex items-center justify-center relative perspective-[1000px]">
                {/* Tumpukan kartu dummy (visual background) */}
                {currentIndex + 1 < questions.length && (
                    <div className="absolute w-full h-[300px] bg-slate-100 rounded-[3rem] border-2 border-slate-200 scale-95 translate-y-4 -z-10"></div>
                )}

                {/* Kartu Aktif */}
                <div className={`w-full h-[300px] bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border-4 border-indigo-50 flex items-center justify-center text-center relative overflow-hidden origin-bottom ${cardAnimationClass}`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

                    <h2 className="text-2xl md:text-3xl font-black text-slate-800 leading-snug relative z-10">
                        "{currentQ.question}"
                    </h2>
                </div>
            </div>

            {/* ACTION BUTTONS (Tinder Style) */}
            <div className="flex gap-6 w-full justify-center pb-8">
                <button
                    disabled={swipeDirection !== null}
                    onClick={() => handleAnswer(false)}
                    className="w-24 h-24 md:w-28 md:h-28 bg-white border-4 border-slate-100 rounded-full flex items-center justify-center text-rose-500 hover:bg-rose-50 hover:border-rose-200 hover:scale-110 hover:-rotate-12 transition-all active:scale-95 shadow-xl disabled:opacity-50"
                >
                    <div className="flex flex-col items-center gap-1">
                        <X size={40} strokeWidth={4} />
                        <span className="font-black text-[10px] uppercase tracking-widest">Salah</span>
                    </div>
                </button>

                <button
                    disabled={swipeDirection !== null}
                    onClick={() => handleAnswer(true)}
                    className="w-24 h-24 md:w-28 md:h-28 bg-white border-4 border-slate-100 rounded-full flex items-center justify-center text-emerald-500 hover:bg-emerald-50 hover:border-emerald-200 hover:scale-110 hover:rotate-12 transition-all active:scale-95 shadow-xl disabled:opacity-50"
                >
                    <div className="flex flex-col items-center gap-1">
                        <Check size={40} strokeWidth={4} />
                        <span className="font-black text-[10px] uppercase tracking-widest">Benar</span>
                    </div>
                </button>
            </div>

        </div>
    );
}