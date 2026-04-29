import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { submitAnswer, finishGame } from "../../../pages/services/game.service";
import socket from "../../../hooks/useSocket";
import { toast } from "react-hot-toast";
import { Link2, CheckCircle2 } from "lucide-react";

export default function MatchingEngine({ data, onGameOver, onIntermission }: { data: any, onGameOver?: any, onIntermission?: () => void }) {
    const navigate = useNavigate();
    const realGameId = data?.id || data?._id;
    const roomCode = data?.shareCode || "";

    const gameConfig = useMemo(() => Array.isArray(data?.gameJson) ? data.gameJson[0] : data?.gameJson, [data]);
    const pairs = useMemo(() => gameConfig?.pairs || [], [gameConfig]);

    // 🔀 Acak posisi item kiri dan kanan agar tidak sejajar
    const { leftItems, rightItems } = useMemo(() => {
        const left = pairs.map((p: any) => p.leftItem).sort(() => Math.random() - 0.5);
        const right = pairs.map((p: any) => p.rightItem).sort(() => Math.random() - 0.5);
        return { leftItems: left, rightItems: right };
    }, [pairs]);

    const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
    const [selectedRight, setSelectedRight] = useState<string | null>(null);
    const [matchedPairs, setMatchedPairs] = useState<any[]>([]);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(pairs.length * 20); // 20 detik per pasang
    const [isFinished, setIsFinished] = useState(false);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [totalTimeSpent, setTotalTimeSpent] = useState(0);

    // ⏱️ Timer
    useEffect(() => {
        if (pairs.length === 0) return;
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
    }, [pairs]);

    const handleTimeUp = () => {
        toast.error("Waktu Habis! ⏰");
        handleFinish(matchedPairs, score);
    };

    // 🧠 Logika Mencocokkan
    useEffect(() => {
        if (selectedLeft && selectedRight) {
            const isCorrect = pairs.some((p: any) => p.leftItem === selectedLeft && p.rightItem === selectedRight);

            if (isCorrect) {
                toast.success("Pasangan Cocok! 🔗");
                const newScore = score + 100;
                setScore(newScore);

                const newMatched = [...matchedPairs, { leftItem: selectedLeft, rightItem: selectedRight, isCorrect: true }];
                setMatchedPairs(newMatched);

                if (roomCode) socket.emit("updateScore", { code: roomCode, score: newScore });

                // Submit socket per pasang (JSON stringify agar masuk ke string answerText)
                submitAnswer(realGameId, matchedPairs.length, JSON.stringify({ leftItem: selectedLeft, rightItem: selectedRight }), newScore).catch(() => { });

                if (newMatched.length === pairs.length) {
                    setTimeout(() => handleFinish(newMatched, newScore), 1000);
                }
            } else {
                toast.error("Tidak Cocok! ❌");
            }

            // Reset seleksi setelah dicocokkan (baik benar/salah)
            setTimeout(() => {
                setSelectedLeft(null);
                setSelectedRight(null);
            }, 500);
        }
    }, [selectedLeft, selectedRight]);

    const handleFinish = async (finalMatches: any[], finalScore: number) => {
        if (isFinished) return;
        if (onIntermission) onIntermission();
        setIsFinished(true);
        if (timerRef.current) clearInterval(timerRef.current);

        // History anti-bolong
        let completeHistory = [...finalMatches];
        if (completeHistory.length < pairs.length) {
            const unmatchedLeft = pairs.filter((p: any) => !finalMatches.some(m => m.leftItem === p.leftItem));
            unmatchedLeft.forEach((p: any) => {
                completeHistory.push({
                    leftItem: p.leftItem,
                    rightItem: null,
                    isCorrect: false
                });
            });
        }

        const accuracy = Math.round((finalMatches.length / pairs.length) * 100);
        const payload = {
            scoreValue: finalScore,
            maxScore: pairs.length * 100,
            accuracy,
            timeSpent: totalTimeSpent,
            answersDetail: completeHistory,
        };

        sessionStorage.setItem("lastScore", finalScore.toString());
        sessionStorage.setItem("lastAccuracy", accuracy.toString());
        sessionStorage.setItem("lastBreakdown", JSON.stringify(payload.answersDetail));

        try {
            await finishGame(realGameId, payload);
        } catch (e) { console.error("Gagal simpan skor"); }

        if (onGameOver) onGameOver(finalScore, accuracy, payload.answersDetail);
        else navigate("/student/result", { state: payload });
    };

    if (pairs.length === 0) return <div className="p-10 text-center animate-pulse">Menyiapkan... 🔗</div>;
    if (isFinished) return <div className="p-20 text-center font-black animate-pulse text-indigo-600">Menyimpan Skor... 🏆</div>;

    return (
        <div className="flex flex-col items-center p-4 space-y-6 max-w-5xl mx-auto w-full font-sans">
            <div className="w-full flex justify-between bg-white p-4 md:p-6 rounded-[2rem] shadow-sm border-2 border-indigo-50 items-center">
                <div className="flex flex-col font-black text-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">Progress</span>
                    <span className="text-xl text-indigo-600">{matchedPairs.length} <span className="text-sm text-slate-300">/ {pairs.length}</span></span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">Sisa Waktu</span>
                    <span className={`text-2xl font-black ${timeLeft <= 10 ? 'text-rose-500 animate-pulse' : 'text-slate-700'}`}>
                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </span>
                </div>
                <div className="text-center flex flex-col font-black">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">Skor</span>
                    <span className="text-indigo-600 text-2xl">{score}</span>
                </div>
            </div>

            <div className="w-full bg-white p-6 md:p-10 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col md:flex-row gap-8 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 w-full h-full bg-indigo-50/50 -translate-x-1/2 blur-3xl -z-10"></div>

                {/* Kolom Kiri */}
                <div className="flex-1 flex flex-col gap-4">
                    <h3 className="text-center font-black text-slate-400 uppercase tracking-widest text-xs mb-2">Pilih Item</h3>
                    {leftItems.map((item: string, i: number) => {
                        const isMatched = matchedPairs.some(m => m.leftItem === item);
                        const isSelected = selectedLeft === item;
                        return (
                            <button
                                key={`l-${i}`}
                                disabled={isMatched}
                                onClick={() => setSelectedLeft(isSelected ? null : item)}
                                className={`p-4 md:p-6 rounded-2xl font-bold text-lg md:text-xl transition-all border-b-4 text-left flex justify-between items-center ${isMatched ? 'bg-emerald-50 text-emerald-400 border-transparent opacity-50' :
                                        isSelected ? 'bg-indigo-500 text-white border-indigo-700 scale-105 shadow-lg' :
                                            'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300'
                                    }`}
                            >
                                <span>{item}</span>
                                {isMatched && <CheckCircle2 size={24} />}
                            </button>
                        );
                    })}
                </div>

                <div className="hidden md:flex flex-col justify-center items-center text-indigo-200">
                    <Link2 size={40} strokeWidth={3} className={selectedLeft && selectedRight ? "animate-ping text-indigo-500" : ""} />
                </div>

                {/* Kolom Kanan */}
                <div className="flex-1 flex flex-col gap-4">
                    <h3 className="text-center font-black text-slate-400 uppercase tracking-widest text-xs mb-2">Cari Pasangannya</h3>
                    {rightItems.map((item: string, i: number) => {
                        const isMatched = matchedPairs.some(m => m.rightItem === item);
                        const isSelected = selectedRight === item;
                        return (
                            <button
                                key={`r-${i}`}
                                disabled={isMatched}
                                onClick={() => setSelectedRight(isSelected ? null : item)}
                                className={`p-4 md:p-6 rounded-2xl font-bold text-lg md:text-xl transition-all border-b-4 text-left flex justify-between items-center ${isMatched ? 'bg-emerald-50 text-emerald-400 border-transparent opacity-50' :
                                        isSelected ? 'bg-amber-500 text-white border-amber-700 scale-105 shadow-lg' :
                                            'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200'
                                    }`}
                            >
                                <span>{item}</span>
                                {isMatched && <CheckCircle2 size={24} />}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}