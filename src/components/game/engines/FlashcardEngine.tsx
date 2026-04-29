import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../../../hooks/useSocket";
import { submitAnswer, finishGame } from "../../../pages/services/game.service";

export default function FlashcardEngine({ data, onGameOver, onIntermission }: { data: any, onGameOver?: any, onIntermission?: () => void }) {
    const navigate = useNavigate();
    const realGameId = data?.id || data?._id;

    const cards = data?.gameJson?.cards || [];
    const [index, setIndex] = useState(0);
    const [show, setShow] = useState(false);
    const [score, setScore] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [breakdown, setBreakdown] = useState<any[]>([]);
    const [timeSpent, setTimeSpent] = useState(0);

    const [timeLeft, setTimeLeft] = useState(15);
    const isBusy = useRef(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const card = cards[index];

    // 1. Timer Global
    useEffect(() => {
        const globalTimer = setInterval(() => setTimeSpent(prev => prev + 1), 1000);
        return () => clearInterval(globalTimer);
    }, []);

    // 2. 🎯 FUNGSI EVALUASI (Dibuat useCallback agar stabil)
    const handleEvaluation = useCallback(async (isCorrect: boolean, isTimeout = false) => {
        if (isBusy.current) return;
        isBusy.current = true;

        if (timerRef.current) clearInterval(timerRef.current);

        setShow(false);
        const points = isCorrect ? 20 : 0;
        const newScore = score + points;
        const newCorrectCount = isCorrect ? correctCount + 1 : correctCount;

        // 🔄 UPDATE STATE LOKAL SEGERA (Agar Student tidak 0)
        setScore(newScore);
        setCorrectCount(newCorrectCount);

        const currentAnswer = {
            word: cards[index]?.front || "Kartu",
            userAnswer: isTimeout ? "Waktu Habis" : (isCorrect ? "Hafal" : "Lupa"),
            isCorrect: isCorrect
        };
        const newBreakdown = [...breakdown, currentAnswer];
        setBreakdown(newBreakdown);

        // 📡 KIRIM KE TEACHER & BACKEND
        if (data.shareCode) {
            socket.emit("updateScore", { code: data.shareCode, score: newScore });
        }
        submitAnswer(realGameId, index, isCorrect ? "HAFAL" : "LUPA", newScore).catch(() => { });

        // ⏱️ TRANSISI SOAL
        setTimeout(() => {
            if (index < cards.length - 1) {
                setIndex(prev => prev + 1);
                isBusy.current = false;
            } else {
                handleFinish(newScore, newBreakdown, newCorrectCount);
            }
        }, 800);
    }, [index, score, correctCount, breakdown, cards, realGameId, data.shareCode]);

    // 3. 🎯 TIMER HITUNG MUNDUR (Reset Instan)
    useEffect(() => {
        // Reset waktu ke 15 seketika saat index berubah
        setTimeLeft(15);
        isBusy.current = false;

        if (timerRef.current) clearInterval(timerRef.current);

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    handleEvaluation(false, true); // Timeout
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [index, handleEvaluation]);

    const handleFinish = async (finalScore: number, finalBreakdown: any[], finalCorrect: number) => {
        const accuracy = Math.round((finalCorrect / cards.length) * 100);
        const payload = {
            scoreValue: finalScore,
            maxScore: cards.length * 20,
            accuracy: accuracy,
            timeSpent: timeSpent,
            answersDetail: finalBreakdown,
        };

        // Simpan ke sessionStorage agar Result Page bisa baca data terbaru
        sessionStorage.setItem("lastScore", finalScore.toString());
        sessionStorage.setItem("lastAccuracy", accuracy.toString());
        sessionStorage.setItem("lastBreakdown", JSON.stringify(finalBreakdown));

        try {
            await finishGame(realGameId, payload);
        } catch (e) { }

        if (onGameOver) {
            onGameOver(finalScore, accuracy, finalBreakdown);
        } else {
            navigate("/student/result", { state: payload });
        }
    };

    if (!card) return null;

    return (
        <div className="flex flex-col items-center justify-center p-6 space-y-8 max-w-2xl mx-auto font-sans">
            {/* HUD */}
            <div className="w-full flex justify-between bg-white p-6 rounded-[2.5rem] shadow-sm border-2 border-indigo-50 items-center">
                <div className="flex flex-col font-black">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">Kartu</span>
                    <span className="text-indigo-600 italic text-xl">{index + 1} / {cards.length}</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Sisa Waktu</span>
                    <span className={`text-2xl font-black ${timeLeft <= 5 ? 'text-rose-500 animate-pulse' : 'text-slate-700'}`}>
                        {timeLeft}s
                    </span>
                </div>
                <div className="text-right flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Skor</span>
                    <span className="text-indigo-600 font-black text-2xl">{score}</span>
                </div>
            </div>

            {/* CARD */}
            <div
                onClick={() => !isBusy.current && setShow(!show)}
                className={`w-full aspect-[4/3] flex items-center justify-center p-8 rounded-[4rem] shadow-2xl cursor-pointer transition-all duration-500 transform ${show ? 'bg-indigo-600 text-white rotate-y-180' : 'bg-white text-slate-800 border-[12px] border-indigo-50'}`}
            >
                <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-4">{show ? "Jawaban" : "Pertanyaan"}</p>
                    <h3 className="text-3xl md:text-5xl font-black leading-tight uppercase italic">{show ? card.back : card.front}</h3>
                </div>
            </div>

            <div className="w-full h-24 flex items-center justify-center">
                {!show ? (
                    <button
                        onClick={() => setShow(true)}
                        disabled={isBusy.current}
                        className="w-full bg-slate-900 text-white py-6 rounded-[2.5rem] font-black text-xl shadow-xl active:scale-95 transition-all uppercase italic"
                    >
                        Buka Jawaban 🔄
                    </button>
                ) : (
                    <div className="flex gap-4 w-full animate-in zoom-in duration-300">
                        <button
                            onClick={() => handleEvaluation(false)}
                            className="flex-1 bg-rose-500 text-white py-6 rounded-[2.5rem] font-black text-xl shadow-xl active:scale-95 transition-all uppercase italic"
                        >
                            Lupa ❌
                        </button>
                        <button
                            onClick={() => handleEvaluation(true)}
                            className="flex-1 bg-emerald-500 text-white py-6 rounded-[2.5rem] font-black text-xl shadow-xl active:scale-95 transition-all uppercase italic"
                        >
                            Hafal ✅
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}