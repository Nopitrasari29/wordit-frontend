import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { submitAnswer, finishGame } from "../../../pages/services/game.service";
import socket from "../../../hooks/useSocket";
import { toast } from "react-hot-toast";
import { Link2, CheckCircle2 } from "lucide-react";

export default function MatchingEngine(props: { data: any, onGameOver?: any, onIntermission?: () => void }) {
    const { data, onGameOver } = props;
    const navigate = useNavigate();
    const realGameId = data?.id || data?._id;
    const roomCode = data?.shareCode || "";

    const gameConfig = useMemo(() => Array.isArray(data?.gameJson) ? data.gameJson[0] : data?.gameJson, [data]);
    const pairs = useMemo(() => gameConfig?.pairs || [], [gameConfig]);

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
    const [timeLeft, setTimeLeft] = useState(gameConfig?.timeLimit ? Number(gameConfig.timeLimit) : pairs.length * 20);
    const [isFinished, setIsFinished] = useState(false);

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

                matchesHistoryRef.current.push(newMatchRecord);
                setMatchedIds(prev => [...prev, selectedLeft.uniqueId, selectedRight.uniqueId]);

                if (roomCode) {
                    const currentAccuracy = Math.round(
                        (matchesHistoryRef.current.filter(m => m.isCorrect).length / pairs.length) * 100
                    );

                    socket.emit("updateScore", {
                        code: roomCode,
                        score: newScore,
                        accuracy: currentAccuracy,
                        progress: `${(matchedIds.length + 2) / 2}/${pairs.length}`,
                    });
                }

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
    }, [selectedLeft, selectedRight, score, pairs.length, matchedIds.length, realGameId, roomCode]);

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

        const maxScoreConfig = gameConfig?.maxScore ? Number(gameConfig.maxScore) : 0;
        const payload = {
            scoreValue: finalScore,
            maxScore: maxScoreConfig || pairs.length * 100,
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
            console.error("Gagal simpan skor");
        }

        navigate("/student/result", {
            state: {
                ...payload,
                accuracy: realAccuracy
            }
        });
    };

    if (pairs.length === 0) return <div className="p-10 text-center animate-pulse text-indigo-650 font-bold">Menyiapkan... 🔗</div>;
    if (isFinished) return <div className="p-20 text-center font-black animate-pulse text-indigo-600">Menyimpan Skor... 🏆</div>;

    return (
        <div className="flex flex-col items-center p-6 space-y-6 max-w-5xl mx-auto w-full font-sans select-none text-slate-800">
            {/* Play Instructions */}
            <div className="w-full bg-indigo-50/75 backdrop-blur-md border border-indigo-100 rounded-2xl p-4 text-center">
                <p className="text-xs font-bold text-indigo-950">
                    🔗 <span>Hubungkan item di kolom kiri dengan pasangan yang tepat di kolom kanan dengan mengeklik keduanya!</span>
                </p>
            </div>

            {/* HUD Header */}
            <div className="w-full flex justify-between bg-slate-900/95 backdrop-blur-md p-5 rounded-[2rem] border border-slate-800 text-white items-center shadow-lg">
                <div className="flex flex-col font-black text-center">
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest mb-0.5">Progress</span>
                    <span className="text-xl text-indigo-400">{matchedIds.length / 2} / {pairs.length}</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest text-center mb-0.5">Waktu</span>
                    <span className={`text-xl font-black px-4 py-0.5 rounded-full border ${timeLeft <= 10 ? 'text-rose-500 border-rose-500/20 bg-rose-500/10 animate-pulse' : 'text-indigo-300 border-indigo-500/10 bg-indigo-500/5'}`}>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                </div>
                <div className="text-center flex flex-col font-black">
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest mb-0.5">Skor</span>
                    <span className="text-indigo-400 text-xl">{score}</span>
                </div>
            </div>

            {/* GAME AREA */}
            <div className="w-full bg-white p-6 md:p-10 rounded-[2.5rem] shadow-xl border border-indigo-50 flex flex-row gap-4 md:gap-8 items-stretch relative overflow-hidden">
                {/* LEFT COLUMN */}
                <div className="flex-1 flex flex-col gap-3">
                    <h3 className="text-center font-black text-indigo-500 uppercase text-[10px] md:text-xs mb-1 tracking-widest bg-indigo-50 py-1.5 rounded-lg border border-indigo-100">Pilih Item</h3>
                    {leftItems.map((item) => {
                        const isMatched = matchedIds.includes(item.uniqueId);
                        const isSelected = selectedLeft?.uniqueId === item.uniqueId;
                        return (
                            <button
                                key={item.uniqueId}
                                disabled={isMatched}
                                onClick={() => setSelectedLeft(isSelected ? null : item)}
                                className={`p-4 md:p-5 rounded-2xl font-black text-xs md:text-base transition-all border-2 text-left flex justify-between items-center ${isMatched ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 opacity-60 cursor-not-allowed shadow-none' :
                                    isSelected ? 'bg-indigo-500 text-white border-indigo-600 scale-[1.02] shadow-lg shadow-indigo-500/20' :
                                        'bg-slate-50 text-slate-700 hover:bg-indigo-50/20 border-slate-100 hover:border-indigo-200'
                                    }`}
                            >
                                <span className="truncate pr-2">{item.text}</span>
                                {isMatched && <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />}
                            </button>
                        );
                    })}
                </div>

                {/* MIDDLE LINK ICON */}
                <div className="hidden md:flex flex-col justify-center items-center text-slate-300">
                    <Link2 size={32} className={selectedLeft && selectedRight ? "animate-bounce text-indigo-500" : ""} />
                </div>

                {/* RIGHT COLUMN */}
                <div className="flex-1 flex flex-col gap-3">
                    <h3 className="text-center font-black text-amber-500 uppercase text-[10px] md:text-xs mb-1 tracking-widest bg-amber-50 py-1.5 rounded-lg border border-amber-100">Cari Pasangannya</h3>
                    {rightItems.map((item) => {
                        const isMatched = matchedIds.includes(item.uniqueId);
                        const isSelected = selectedRight?.uniqueId === item.uniqueId;
                        return (
                            <button
                                key={item.uniqueId}
                                disabled={isMatched}
                                onClick={() => setSelectedRight(isSelected ? null : item)}
                                className={`p-4 md:p-5 rounded-2xl font-black text-xs md:text-base transition-all border-2 text-left flex justify-between items-center ${isMatched ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 opacity-60 cursor-not-allowed shadow-none' :
                                    isSelected ? 'bg-amber-500 text-white border-amber-600 scale-[1.02] shadow-lg shadow-amber-500/20' :
                                        'bg-slate-50 text-slate-700 hover:bg-indigo-50/20 border-slate-100 hover:border-indigo-200'
                                    }`}
                            >
                                <span className="truncate pr-2">{item.text}</span>
                                {isMatched && <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}