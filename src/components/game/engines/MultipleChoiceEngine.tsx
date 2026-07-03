import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { submitAnswer, finishGame } from "../../../pages/services/game.service";
import socket from "../../../hooks/useSocket";
import { toast } from "react-hot-toast";

interface GameAnswer {
    questionIndex: number;
    question: string;
    selectedAnswer: string | null;
    correctAnswer: string;
    isCorrect: boolean;
}

export default function MultipleChoiceEngine({ data, onGameOver, onIntermission }: { data: any, onGameOver?: any, onIntermission?: () => void }) {
    const navigate = useNavigate();
    const realGameId = data?.id || data?._id;
    const roomCode = data?.shareCode || "";

    const gameConfig = useMemo(() => Array.isArray(data?.gameJson) ? data.gameJson[0] : data?.gameJson, [data]);
    const questions = useMemo(() => gameConfig?.questions || [], [gameConfig]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(gameConfig?.timeLimit ? Number(gameConfig.timeLimit) : questions.length * 15);
    const [isFinished, setIsFinished] = useState(false);

    const historyRef = useRef<GameAnswer[]>([]);
    const scoreRef = useRef(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

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
            setTotalTimeSpent(prev => prev + 1);
        }, 1000);

        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [questions]);

    const handleTimeUp = () => {
        toast.error("Waktu Habis! ⏰");
        handleFinish(historyRef.current, scoreRef.current);
    };

    const handleAnswer = (option: string) => {
        if (selectedOption || isFinished) return;
        setSelectedOption(option);

        const currentQ = questions[currentIndex];
        const isCorrect = option === currentQ.correctAnswer;

        const maxScoreConfig = Number(gameConfig?.maxScore);
        const pointsPerQuestion = maxScoreConfig && maxScoreConfig > 0 && questions.length > 0
          ? Math.round(maxScoreConfig / questions.length)
          : 100;
        const pointsEarned = isCorrect ? pointsPerQuestion : 0;
        const newScore = score + pointsEarned;

        setScore(newScore);
        scoreRef.current = newScore;

        const answerRecord: GameAnswer = {
            questionIndex: currentIndex,
            question: currentQ.question,
            selectedAnswer: option,
            correctAnswer: currentQ.correctAnswer,
            isCorrect
        };
        historyRef.current = [...historyRef.current, answerRecord];

        if (isCorrect) toast.success("Benar! 🎉");
        else toast.error("Salah! ❌");

        if (roomCode) {
            const correctCount = historyRef.current.filter(h => h.isCorrect).length;
            const accuracy = Math.round((correctCount / historyRef.current.length) * 100);
            const progress = `${currentIndex + 1}/${questions.length}`;
            socket.emit("updateScore", { code: roomCode, score: newScore, accuracy, progress });
        }
        submitAnswer(realGameId, currentIndex, option, newScore).catch(() => { });

        setTimeout(() => {
            setSelectedOption(null);
            if (currentIndex + 1 < questions.length) {
                if (onIntermission) onIntermission();
                setCurrentIndex(currentIndex + 1);
            } else {
                handleFinish(historyRef.current, newScore);
            }
        }, 1200);
    };

    const handleFinish = async (finalHistory: GameAnswer[], finalScore: number) => {
        if (isFinished) return;
        setIsFinished(true);
        if (timerRef.current) clearInterval(timerRef.current);

        const completeHistory: GameAnswer[] = questions.map((q: any, index: number) => {
            const historyItem = finalHistory.find(h => h.questionIndex === index);
            if (historyItem) return historyItem;

            return {
                questionIndex: index,
                question: q.question,
                selectedAnswer: null,
                correctAnswer: q.correctAnswer,
                isCorrect: false
            };
        });

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

    if (questions.length === 0) return <div className="p-10 text-center text-slate-400 font-bold animate-pulse">Menyiapkan arena... 🏟️</div>;
    if (isFinished) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-widest text-indigo-600">Menyimpan Skor... 🏆</div>;

    const currentQ = questions[currentIndex];

    const indicatorStyles = [
        "bg-rose-500 text-white",
        "bg-blue-500 text-white",
        "bg-amber-500 text-white",
        "bg-emerald-500 text-white"
    ];

    return (
        <div className="flex flex-col items-center p-6 space-y-6 max-w-4xl mx-auto font-sans w-full select-none">
            {/* Play Instructions */}
            <div className="w-full bg-indigo-50/75 backdrop-blur-md border border-indigo-100 rounded-2xl p-4 text-center">
                <p className="text-xs font-bold text-indigo-950">
                    📝 <span>Pilihlah satu jawaban yang paling tepat dari pilihan ganda di bawah sebelum waktu habis!</span>
                </p>
            </div>

            {/* HUD HEADER */}
            <div className="w-full flex justify-between bg-slate-900/95 backdrop-blur-md p-5 rounded-[2rem] border border-slate-800 text-white items-center shadow-lg">
                <div className="flex flex-col font-black text-center">
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest">Soal</span>
                    <span className="text-lg text-indigo-400">{currentIndex + 1} <span className="text-xs text-slate-500">/ {questions.length}</span></span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest mb-0.5">Sisa Waktu</span>
                    <span className={`text-xl font-black px-4 py-0.5 rounded-full border ${timeLeft <= 10 ? 'text-rose-500 border-rose-500/20 bg-rose-500/10 animate-pulse' : 'text-indigo-300 border-indigo-500/10 bg-indigo-500/5'}`}>
                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </span>
                </div>
                <div className="text-right flex flex-col font-black">
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest mb-0.5">Skor</span>
                    <span className="text-indigo-400 text-xl">{score}</span>
                </div>
            </div>

            {/* QUESTION CARD */}
            <div className="w-full bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-indigo-50/80 text-center min-h-[200px] flex flex-col justify-center items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-10" />
                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full mb-3">Pertanyaan Kuis</span>
                <h2 className="text-xl md:text-3xl font-black text-slate-800 leading-snug relative z-10 px-4">
                    {currentQ.question}
                </h2>
            </div>

            {/* OPTIONS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {currentQ.options.map((opt: string, i: number) => {
                    let cardStyle = "bg-white border-slate-100 hover:border-indigo-300 text-slate-700 hover:bg-indigo-50/25";
                    let indStyle = indicatorStyles[i % indicatorStyles.length];

                    if (selectedOption) {
                        if (opt === currentQ.correctAnswer) {
                            cardStyle = "bg-emerald-500 border-emerald-600 text-white shadow-lg shadow-emerald-500/20 scale-[1.02] z-10";
                            indStyle = "bg-white text-emerald-600";
                        } else if (opt === selectedOption && opt !== currentQ.correctAnswer) {
                            cardStyle = "bg-rose-500 border-rose-600 text-white shadow-lg shadow-rose-500/20 scale-[0.98]";
                            indStyle = "bg-white text-rose-600";
                        } else {
                            cardStyle = "bg-slate-50 border-slate-200 text-slate-400 opacity-45 cursor-default scale-98";
                            indStyle = "bg-slate-300 text-slate-500";
                        }
                    }

                    return (
                        <button
                            key={i}
                            disabled={selectedOption !== null}
                            onClick={() => handleAnswer(opt)}
                            className={`w-full text-left p-5 md:p-6 rounded-2xl border-2 font-black transition-all duration-300 active:scale-98 flex items-center gap-4 ${cardStyle}`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-black text-base md:text-lg shadow-sm transition-colors ${indStyle}`}>
                                {["A", "B", "C", "D"][i]}
                            </div>
                            <span className="leading-snug text-sm md:text-base">{opt}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}