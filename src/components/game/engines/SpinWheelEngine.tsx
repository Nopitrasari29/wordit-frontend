import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { submitAnswer, finishGame } from "../../../pages/services/game.service";
import socket from "../../../hooks/useSocket";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function SpinWheelEngine({ data, onIntermission, onGameOver }: { data: any, onIntermission?: any, onGameOver?: any }) {
    const questions = data?.gameJson?.questions || [];
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
    const [timeLeft, setTimeLeft] = useState(15);
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
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const startTimer = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        setTimeLeft(15);
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
    }, [completedCount]);

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
        setTimeout(() => {
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
            if (roomCode) socket.emit("updateScore", { code: roomCode, score: newScore });
        } else {
            setLives(newLives);
            toast.error(finalInput === "TIMEOUT" ? "Waktu Habis! ⏰" : "Salah Jawaban! ❌");
        }

        const currentHistoryItem = { word: finalInput, isCorrect, time: 15 - timeLeft };
        const updatedHistory = [...history, currentHistoryItem];
        setHistory(updatedHistory);

        submitAnswer(realGameId, questions.indexOf(selectedQuestion), finalInput, newScore).catch(() => { });

        setTimeout(() => {
            const isGameOver = newLives <= 0 || completedCount + 1 >= questions.length;
            if (isGameOver) {
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

                finishGame(realGameId, payload).catch(() => { });
                if (onGameOver) onGameOver(newScore, accuracy, updatedHistory);
                else navigate("/student/result", { state: payload });
            } else {
                if (onIntermission) onIntermission();
                setCompletedCount(prev => prev + 1);
                setIsAnswered(false);
                setSelectedQuestion(null);
                isBusy.current = false;
            }
        }, 2000);
    };

    useEffect(() => {
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, []);

    // 🎨 DINAMIS: Membuat warna roda berdasarkan jumlah soal & status selesai
    const wheelStyle = useMemo(() => {
        if (questions.length === 0) return {};
        const degreePerItem = 360 / questions.length;
        const colors = ["#6366f1", "#10b981", "#f59e0b", "#f43f5e", "#06b6d4", "#8b5cf6"];
        
        const gradientParts = questions.map((_: any, i: number) => {
            const start = i * degreePerItem;
            const end = (i + 1) * degreePerItem;
            // Jika soal ini sudah dijawab, buat jadi abu-abu
            const color = i < completedCount ? "#e2e8f0" : colors[i % colors.length];
            return `${color} ${start}deg ${end}deg`;
        });

        return {
            transform: `rotate(${rotation}deg)`,
            background: `conic-gradient(${gradientParts.join(", ")})`
        };
    }, [questions.length, rotation, completedCount]);

    if (questions.length === 0) return null;

    return (
        <div className="flex flex-col items-center p-6 space-y-10 max-w-xl mx-auto font-sans select-none">
            {/* HUD */}
            <div className="w-full flex justify-between bg-white p-6 rounded-[2.5rem] shadow-sm border-2 border-indigo-50">
                <div className="flex flex-col text-center items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nyawa</span>
                    <span>{"❤️".repeat(Math.max(0, lives))}</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Waktu</span>
                    <span className={`text-2xl font-black ${timeLeft <= 5 && timeLeft > 0 ? 'text-rose-500 animate-pulse' : 'text-slate-700'}`}>
                        {selectedQuestion && !isAnswered ? `${timeLeft}s` : "--"}
                    </span>
                </div>
                <div className="text-right flex flex-col font-black">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">Skor</span>
                    <p className="text-indigo-600 text-2xl">{score}</p>
                </div>
            </div>

            {/* WHEEL AREA */}
            <div className="relative">
                <div
                    className="w-64 h-64 md:w-80 md:h-80 rounded-full border-[12px] border-slate-900 shadow-2xl transition-transform duration-[3000ms] cubic-bezier(0.15, 0, 0.15, 1)"
                    style={wheelStyle}
                />
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-4xl animate-bounce">👇</div>
            </div>

            {!selectedQuestion ? (
                <button
                    onClick={spinWheel}
                    disabled={spinning || lives <= 0}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed disabled:shadow-none text-white py-6 rounded-[2.5rem] font-black text-xl uppercase shadow-xl transition-all active:scale-95"
                >
                    {spinning ? "BERPUTAR..." : "PUTAR RODA! 🚀"}
                </button>
            ) : (
                <div className="w-full bg-white p-8 rounded-[3.5rem] shadow-xl border-2 border-indigo-50 text-center space-y-6 animate-in zoom-in duration-300">
                    <h3 className="text-2xl font-black italic text-slate-800">"{selectedQuestion.question}"</h3>
                    <div className="grid grid-cols-2 gap-4 w-full pt-4">
                        {choices.map((choice: string, i: number) => {
                            const isCorrectChoice = choice.toLowerCase() === selectedQuestion.answer.toLowerCase();
                            let btnStyle = "bg-slate-50 hover:bg-indigo-50 border-slate-100 hover:border-indigo-300 text-slate-700 hover:text-indigo-600";
                            if (isAnswered) {
                                if (isCorrectChoice) {
                                    btnStyle = "bg-emerald-500 border-emerald-600 text-white cursor-default";
                                } else if (userInput.toLowerCase() === choice.toLowerCase()) {
                                    btnStyle = "bg-rose-500 border-rose-600 text-white cursor-default";
                                } else {
                                    btnStyle = "bg-slate-100 border-slate-200 text-slate-400 opacity-50 cursor-default";
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
                                    className={`p-4 md:p-6 border-2 rounded-[2rem] font-black text-sm md:text-base transition-all active:scale-95 shadow-sm uppercase ${btnStyle}`}
                                >
                                    {choice}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}