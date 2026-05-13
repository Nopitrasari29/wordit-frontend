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

    // 🛠️ ID unik berbasis indeks
    const { leftItems, rightItems } = useMemo(() => {
        const left = pairs.map((p: any, i: number) => ({
            uniqueId: `L-${i}`,
            text: p.leftItem,
            matchText: p.rightItem,
            originalIndex: i
        }));
        const right = pairs.map((p: any, i: number) => ({
            uniqueId: `R-${i}`,
            text: p.rightItem,
            originalIndex: i
        }));
        return {
            leftItems: [...left].sort(() => Math.random() - 0.5),
            rightItems: [...right].sort(() => Math.random() - 0.5)
        };
    }, [pairs]);

    const [selectedLeft, setSelectedLeft] = useState<any | null>(null);
    const [selectedRight, setSelectedRight] = useState<any | null>(null);
    const [matchedIds, setMatchedIds] = useState<string[]>([]);
    const [score, setScore] = useState(0);
    const scoreRef = useRef(0);
    const [timeLeft, setTimeLeft] = useState(pairs.length * 20);
    const [isFinished, setIsFinished] = useState(false);

    // 🛠️ FIX: Gunakan Ref untuk history agar tidak memicu re-render looping
    const matchesHistoryRef = useRef<any[]>([]);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [totalTimeSpent, setTotalTimeSpent] = useState(0);

    useEffect(() => {
        if (pairs.length === 0) return;
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current);
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
        handleFinish(matchesHistoryRef.current, scoreRef.current);
    };

    // 🧠 Matching Logic (Hanya mengawasi seleksi, bukan history)
    useEffect(() => {
        if (selectedLeft && selectedRight) {
            const isCorrect = selectedLeft.originalIndex === selectedRight.originalIndex;

            if (isCorrect) {
                toast.success("Pasangan Cocok! 🔗");
                const newScore = score + 100;
                setScore(newScore);
                scoreRef.current = newScore;

                const newMatchRecord = {
                    questionIndex: selectedLeft.originalIndex,
                    leftItem: selectedLeft.text,
                    rightItem: selectedRight.text,
                    isCorrect: true
                };

                // Update data secara sinkron
                matchesHistoryRef.current.push(newMatchRecord);
                setMatchedIds(prev => [...prev, selectedLeft.uniqueId, selectedRight.uniqueId]);

                if (roomCode) socket.emit("updateScore", { code: roomCode, score: newScore });

                submitAnswer(realGameId, selectedLeft.originalIndex, JSON.stringify({
                    leftItem: selectedLeft.text,
                    rightItem: selectedRight.text
                }), newScore).catch(() => { });

                // Selesai jika jumlah match = jumlah pairs
                if (matchesHistoryRef.current.filter(m => m.isCorrect).length === pairs.length) {
                    setTimeout(() => handleFinish(matchesHistoryRef.current, newScore), 800);
                }
            } else {
                toast.error("Tidak Cocok! ❌");
                const failedMatch = {
                    questionIndex: selectedLeft.originalIndex,
                    leftItem: selectedLeft.text,
                    rightItem: selectedRight.text,
                    isCorrect: false
                };
                // Catat jika belum pernah dijawab salah sebelumnya
                if (!matchesHistoryRef.current.find(m => m.questionIndex === failedMatch.questionIndex)) {
                    matchesHistoryRef.current.push(failedMatch);
                }
            }

            // Reset seleksi dengan jeda agar animasi terlihat
            setTimeout(() => {
                setSelectedLeft(null);
                setSelectedRight(null);
            }, 400);
        }
    }, [selectedLeft, selectedRight]); // 🛠️ Hanya dependensi seleksi!

    const handleFinish = async (finalMatches: any[], finalScore: number) => {
        if (isFinished) return;
        setIsFinished(true);
        if (timerRef.current) clearInterval(timerRef.current);

        const completeHistory = pairs.map((p: any, index: number) => {
            const found = finalMatches.find(m => m.questionIndex === index && m.isCorrect);

            return {
                questionIndex: index,
                question: `Pasangan dari "${p.leftItem}"`,
                selectedAnswer: found ? { leftItem: p.leftItem, rightItem: p.rightItem } : "(Tidak dijawab)",
                displaySelected: found ? found.rightItem : "(Tidak dijawab)",
                correctAnswer: p.rightItem,
                isCorrect: !!found
            };
        });

        const correctCount = finalMatches.filter(m => m.isCorrect).length;
        const realAccuracy = pairs.length > 0 ? Math.round((correctCount / pairs.length) * 100) : 0;

        const payload = {
            scoreValue: finalScore,
            maxScore: pairs.length * 100,
            accuracy: realAccuracy,
            timeSpent: totalTimeSpent,
            answersDetail: completeHistory,
        };

        sessionStorage.setItem("lastScore", finalScore.toString());
        sessionStorage.setItem("lastAccuracy", realAccuracy.toString());
        sessionStorage.setItem("lastBreakdown", JSON.stringify(completeHistory));

        try {
            await finishGame(realGameId, payload);
        } catch (e) { console.error("Gagal simpan skor"); }

        if (onGameOver) onGameOver(finalScore, realAccuracy, completeHistory);
        else navigate("/student/result", { state: { ...payload, accuracy: realAccuracy } });
    };

    if (pairs.length === 0) return <div className="p-10 text-center animate-pulse">Menyiapkan... 🔗</div>;
    if (isFinished) return <div className="p-20 text-center font-black animate-pulse text-indigo-600">Menyimpan Skor... 🏆</div>;

    return (
        <div className="flex flex-col items-center p-4 space-y-6 max-w-5xl mx-auto w-full font-sans text-slate-800">
            <div className="w-full flex justify-between bg-white p-4 md:p-6 rounded-[2rem] shadow-sm border-2 border-indigo-50 items-center">
                <div className="flex flex-col font-black text-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">Progress</span>
                    <span className="text-xl text-indigo-600">{matchedIds.length / 2} / {pairs.length}</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">Waktu</span>
                    <span className={`text-2xl font-black ${timeLeft <= 10 ? 'text-rose-500 animate-pulse' : 'text-slate-700'}`}>{timeLeft}s</span>
                </div>
                <div className="text-center flex flex-col font-black">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">Skor</span>
                    <span className="text-indigo-600 text-2xl">{score}</span>
                </div>
            </div>

            <div className="w-full bg-white p-6 md:p-10 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col md:flex-row gap-8 relative overflow-hidden">
                <div className="flex-1 flex flex-col gap-4">
                    <h3 className="text-center font-black text-slate-400 uppercase text-xs mb-2 tracking-widest">Pilih Item</h3>
                    {leftItems.map((item) => {
                        const isMatched = matchedIds.includes(item.uniqueId);
                        const isSelected = selectedLeft?.uniqueId === item.uniqueId;
                        return (
                            <button
                                key={item.uniqueId}
                                disabled={isMatched}
                                onClick={() => setSelectedLeft(isSelected ? null : item)}
                                className={`p-4 md:p-6 rounded-2xl font-bold text-lg transition-all border-b-4 text-left flex justify-between items-center ${isMatched ? 'bg-emerald-50 text-emerald-400 border-transparent opacity-50 cursor-not-allowed' :
                                    isSelected ? 'bg-indigo-500 text-white border-indigo-700 scale-105 shadow-lg' :
                                        'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300'
                                    }`}
                            >
                                <span>{item.text}</span>
                                {isMatched && <CheckCircle2 size={20} />}
                            </button>
                        );
                    })}
                </div>

                <div className="hidden md:flex flex-col justify-center items-center text-indigo-200">
                    <Link2 size={40} className={selectedLeft && selectedRight ? "animate-bounce text-indigo-500" : ""} />
                </div>

                <div className="flex-1 flex flex-col gap-4">
                    <h3 className="text-center font-black text-slate-400 uppercase text-xs mb-2 tracking-widest">Cari Pasangannya</h3>
                    {rightItems.map((item) => {
                        const isMatched = matchedIds.includes(item.uniqueId);
                        const isSelected = selectedRight?.uniqueId === item.uniqueId;
                        return (
                            <button
                                key={item.uniqueId}
                                disabled={isMatched}
                                onClick={() => setSelectedRight(isSelected ? null : item)}
                                className={`p-4 md:p-6 rounded-2xl font-bold text-lg transition-all border-b-4 text-left flex justify-between items-center ${isMatched ? 'bg-emerald-50 text-emerald-400 border-transparent opacity-50 cursor-not-allowed' :
                                    isSelected ? 'bg-amber-500 text-white border-amber-700 scale-105 shadow-lg' :
                                        'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200'
                                    }`}
                            >
                                <span>{item.text}</span>
                                {isMatched && <CheckCircle2 size={20} />}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}