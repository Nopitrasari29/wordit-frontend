import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { submitAnswer, finishGame } from "../../../pages/services/game.service";
import socket from "../../../hooks/useSocket";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function SpinWheelEngine({ data, onIntermission, onGameOver }: { data: any, onIntermission?: any, onGameOver?: any }) {
    const gameConfig = Array.isArray(data?.gameJson) ? data.gameJson[0] : data?.gameJson;
    const questions = gameConfig?.questions || [];
    const realGameId = data?.id || data?._id;
    const roomCode = data?.shareCode || "";
    const navigate = useNavigate();

    const [spinning, setSpinning] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
    const [userInput, setUserInput] = useState("");
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [completedCount, setCompletedCount] = useState(0);
    const [rotation, setRotation] = useState(0);
    const [timeLeft, setTimeLeft] = useState(gameConfig?.timeLimit ? Number(gameConfig.timeLimit) : 15);
    const [history, setHistory] = useState<any[]>([]);

    const choices = useMemo(() => {
        if (!selectedQuestion) return [];
        const allAnswers = questions.map((q: any) => q.answer);
        const distractors = allAnswers
            .filter((a: string) => a.toLowerCase() !== selectedQuestion.answer.toLowerCase())
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);
        while (distractors.length < 3) {
            distractors.push("Opsi " + (distractors.length + 1));
        }
        return [selectedQuestion.answer, ...distractors].sort(() => Math.random() - 0.5);
    }, [selectedQuestion, questions]);

    const isBusy = useRef(false);
    const isSavingRef = useRef(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const transitionRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Cleanup timers on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (transitionRef.current) clearTimeout(transitionRef.current);
        };
    }, []);

    const startTimer = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        setTimeLeft(gameConfig?.timeLimit ? Number(gameConfig.timeLimit) : 15);
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    handleResult(false, "TIMEOUT");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [completedCount, gameConfig]);

    const spinWheel = () => {
        if (spinning || isBusy.current || lives <= 0 || completedCount >= questions.length) return;
        setSpinning(true);
        setSelectedQuestion(null);
        setUserInput("");
        setIsAnswered(false);
        isBusy.current = false;

        const extraSpins = 5 + Math.floor(Math.random() * 5);
        const randomIndex = Math.floor(Math.random() * questions.length);
        const degreePerItem = 360 / questions.length;
        const finalRotation = rotation + (extraSpins * 360) + (randomIndex * degreePerItem);

        setRotation(finalRotation);
        transitionRef.current = setTimeout(() => {
            setSpinning(false);
            setSelectedQuestion(questions[randomIndex]);
            startTimer();
        }, 3000);
    };

    const handleResult = async (isCorrect: boolean, finalInput: string) => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (isBusy.current) return;
        isBusy.current = true;
        setIsAnswered(true);

        const newScore = isCorrect ? score + 100 : score;
        const newLives = isCorrect ? lives : lives - 1;

        if (isCorrect) {
            setScore(newScore);
            toast.success("BENAR! +100 Skor 🌟");
            if (roomCode) {
                const currentAccuracy = Math.round(
                    (newScore / ((completedCount + 1) * 100)) * 100
                );

                socket.emit("updateScore", {
                    code: roomCode,
                    score: newScore,
                    accuracy: currentAccuracy,
                    progress: `${completedCount + 1}/${questions.length}`,
                });
            }
        } else {
            setLives(newLives);
            toast.error(finalInput === "TIMEOUT" ? "Waktu Habis! ⏰" : "Salah Jawaban! ❌");
        }

        const currentHistoryItem = { 
            word: finalInput, 
            isCorrect, 
            time: (gameConfig?.timeLimit ? Number(gameConfig.timeLimit) : 15) - timeLeft 
        };
        const updatedHistory = [...history, currentHistoryItem];
        setHistory(updatedHistory);

        submitAnswer(realGameId, questions.indexOf(selectedQuestion), finalInput, newScore).catch(() => { });

        setTimeout(() => {
            const isGameOver = newLives <= 0 || completedCount + 1 >= questions.length;
            if (isGameOver) {
                if (isSavingRef.current) return;
                isSavingRef.current = true;
                const accuracy = Math.round((newScore / (questions.length * 100)) * 100);
                const payload = {
                    scoreValue: newScore,
                    maxScore: questions.length * 100,
                    accuracy,
                    timeSpent: 0,
                    answersDetail: updatedHistory
                };

                sessionStorage.setItem("lastScore", newScore.toString());
                sessionStorage.setItem("lastAccuracy", accuracy.toString());
                sessionStorage.setItem("lastBreakdown", JSON.stringify(updatedHistory));

                if (onGameOver) {
                    onGameOver(newScore, accuracy, updatedHistory);
                    return;
                }

                finishGame(realGameId, payload).catch(() => { });
                navigate("/student/result", { state: payload });
            } else {
                if (onIntermission) onIntermission();
                setCompletedCount(prev => prev + 1);
                setIsAnswered(false);
                setSelectedQuestion(null);
                isBusy.current = false;
            }
        }, 2000);
    };

    // 🎨 DINAMIS: Membuat warna roda berdasarkan jumlah soal & status selesai
    const wheelStyle = useMemo(() => {
        if (questions.length === 0) return {};
        const degreePerItem = 360 / questions.length;
        const colors = ["#6366f1", "#10b981", "#f59e0b", "#f43f5e", "#06b6d4", "#8b5cf6"];
        
        const gradientParts = questions.map((_: any, i: number) => {
            const start = i * degreePerItem;
            const end = (i + 1) * degreePerItem;
            // Jika soal ini sudah dijawab, buat jadi abu-abu
            const color = i < completedCount ? "#cbd5e1" : colors[i % colors.length];
            return `${color} ${start}deg ${end}deg`;
        });

        return {
            transform: `rotate(-${rotation}deg)`,
            background: `conic-gradient(${gradientParts.join(", ")})`
        };
    }, [questions.length, rotation, completedCount]);

    if (questions.length === 0) return null;

    return (
        <div className="flex flex-col items-center p-6 space-y-6 max-w-xl mx-auto font-sans select-none w-full">
            
            {/* Play Instructions Banner */}
            <div className="w-full bg-indigo-50/75 backdrop-blur-md border border-indigo-100 rounded-2xl p-4 text-center">
                <p className="text-xs font-bold text-indigo-950 flex items-center justify-center gap-2">
                    🎡 <span>Putar Roda keberuntungan kuis untuk mengundi soal secara acak, kemudian pilih jawaban yang benar!</span>
                </p>
            </div>

            {/* HUD */}
            <div className="w-full flex justify-between bg-slate-900/95 backdrop-blur-md p-5 rounded-[2rem] shadow-lg border border-slate-800 text-white items-center">
                <div className="flex flex-col items-center">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Nyawa</span>
                    <div className="flex gap-0.5">
                        {[...Array(3)].map((_, i) => (
                            <span key={i} className={`text-sm transition-all duration-300 ${i < lives ? 'scale-100' : 'grayscale opacity-20 scale-75'}`}>❤️</span>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center mb-0.5">Sisa Waktu</span>
                    <span className={`text-xl font-black px-4 py-0.5 rounded-full border ${selectedQuestion && !isAnswered && timeLeft <= 5 ? 'text-rose-500 border-rose-500/20 bg-rose-500/10 animate-pulse' : 'text-indigo-300 border-indigo-500/10 bg-indigo-500/5'}`}>
                        {selectedQuestion && !isAnswered ? `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}` : "--"}
                    </span>
                </div>
                <div className="text-right flex flex-col font-black">
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest mb-0.5">Skor</span>
                    <p className="text-indigo-400 text-xl">{score}</p>
                </div>
            </div>

            {/* WHEEL AREA */}
            <div className="relative flex items-center justify-center py-6">
                {/* Metallic shadow outer frame */}
                <div className="absolute w-[274px] h-[274px] md:w-[338px] md:h-[338px] rounded-full border-4 border-slate-800 shadow-[0_0_60px_rgba(99,102,241,0.15)] bg-slate-900 -z-10" />
                
                {/* Pointer indicator */}
                <div className="absolute -top-1 z-30 flex flex-col items-center">
                    <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[28px] border-t-rose-500 drop-shadow-[0_4px_6px_rgba(244,63,94,0.4)] animate-bounce" />
                    <div className="w-3 h-3 bg-white rounded-full -mt-2.5 border-2 border-rose-500 z-40" />
                </div>

                {/* Rotating Wheel */}
                <div
                    className="w-64 h-64 md:w-80 md:h-80 rounded-full border-[10px] border-slate-900 shadow-2xl transition-transform duration-[3000ms]"
                    style={{
                        ...wheelStyle,
                        transitionTimingFunction: "cubic-bezier(0.15, 0, 0.15, 1)"
                    }}
                />
                
                {/* Center cap */}
                <div className="absolute w-12 h-12 rounded-full bg-slate-950 border-[6px] border-slate-800 shadow-xl flex items-center justify-center z-20">
                    <div className="w-3.5 h-3.5 bg-indigo-500 rounded-full animate-ping" />
                </div>
            </div>

            <div className="w-full min-h-[120px] flex items-center justify-center">
                {!selectedQuestion ? (
                    <button
                        onClick={spinWheel}
                        disabled={spinning || lives <= 0}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:border-slate-850 disabled:cursor-not-allowed text-white py-5 rounded-[2rem] font-black text-lg uppercase shadow-xl transition-all active:scale-95 border border-indigo-500/30 shadow-indigo-600/10 hover:shadow-indigo-500/20"
                    >
                        {spinning ? "BERPUTAR..." : "PUTAR RODA! 🚀"}
                    </button>
                ) : (
                    <div className="w-full bg-white p-6 rounded-[2.5rem] shadow-xl border border-indigo-50 text-center space-y-5 animate-in zoom-in duration-300">
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 w-max mx-auto">
                            Soal Terpilih 🎡
                        </span>
                        <h3 className="text-xl md:text-2xl font-black italic text-slate-800 leading-tight">"{selectedQuestion.question}"</h3>
                        <div className="grid grid-cols-2 gap-3.5 w-full pt-2">
                            {choices.map((choice: string, i: number) => {
                                const isCorrectChoice = choice.toLowerCase() === selectedQuestion.answer.toLowerCase();
                                let btnStyle = "bg-slate-50 hover:bg-indigo-50/50 border-slate-100 hover:border-indigo-200 text-slate-700 hover:text-indigo-600";
                                if (isAnswered) {
                                    if (isCorrectChoice) {
                                        btnStyle = "bg-emerald-500 border-emerald-600 text-white cursor-default shadow-md shadow-emerald-500/20";
                                    } else if (userInput.toLowerCase() === choice.toLowerCase()) {
                                        btnStyle = "bg-rose-500 border-rose-600 text-white cursor-default shadow-md shadow-rose-500/20";
                                    } else {
                                        btnStyle = "bg-slate-100 border-slate-200 text-slate-400 opacity-45 cursor-default";
                                    }
                                }
                                return (
                                    <button
                                        key={i}
                                        disabled={isAnswered}
                                        onClick={() => {
                                            setUserInput(choice);
                                            handleResult(isCorrectChoice, choice);
                                        }}
                                        className={`p-3.5 border-2 rounded-2xl font-black text-xs md:text-sm transition-all active:scale-95 shadow-sm uppercase ${btnStyle}`}
                                    >
                                        {choice}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}