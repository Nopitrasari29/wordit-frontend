import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../../../hooks/useSocket";
import { submitAnswer, finishGame } from "../../../pages/services/game.service";
import { toast } from "react-hot-toast";

export default function HangmanEngine({
    data,
    onIntermission,
    onGameOver,
}: {
    data: any,
    onIntermission?: () => void,
    onGameOver?: (
        score?: number,
        accuracy?: number,
        breakdown?: any[]
    ) => void
}) {
    const navigate = useNavigate();
    const realGameId = data?.id || data?._id;
    const roomCode = data?.shareCode || "";

    const quizWords = useMemo(() => {
        const json = data?.gameJson;
        if (Array.isArray(json)) return json[0]?.words || [];
        return json?.words || [];
    }, [data]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [used, setUsed] = useState<string[]>([]);
    const [guess, setGuess] = useState("");
    const [lives, setLives] = useState(6);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [breakdown, setBreakdown] = useState<any[]>([]);
    const [timeLeft, setTimeLeft] = useState(data?.gameJson?.timeLimit ? Number(data.gameJson.timeLimit) : 30);
    const [feedback, setFeedback] = useState<'none' | 'correct' | 'incorrect' | 'timeout' | 'lose'>('none');
    const timerRef = useRef<any>(null);
    const totalTimeRef = useRef(0);
    const isSavingRef = useRef(false);
    const isBusy = useRef(false);

    const currentData = quizWords[currentIndex];
    const word = currentData?.word?.toUpperCase() || "";

    // 1. Timer Logic
    useEffect(() => {
        if (feedback !== 'none' || isFinished || quizWords.length === 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    if (timerRef.current) {
                        clearInterval(timerRef.current);
                    }
                    handleEndTurn('timeout');
                    return 0;
                }
                return prev - 1;
            });
            totalTimeRef.current += 1;
        }, 1000);

        timerRef.current = timer;

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [currentIndex, feedback, isFinished, quizWords.length]);

    const handleEndTurn = (status: 'correct' | 'timeout' | 'lose') => {
        if (isBusy.current) return;
        isBusy.current = true;

        setFeedback(status);
        const isCorrect = status === 'correct';
        let earnedPoints = 0;

        if (isCorrect) {
            earnedPoints = 100 + (lives * 10);
            const newScore = score + earnedPoints;
            setScore(newScore);

            if (roomCode) {
                const currentAccuracy = Math.round(
                    ((breakdown.filter(b => b.isCorrect).length + 1) / (currentIndex + 1)) * 100
                );

                socket.emit("updateScore", {
                    code: roomCode,
                    score: newScore,
                    accuracy: currentAccuracy,
                    progress: `${currentIndex + 1}/${quizWords.length}`,
                });
            }

            submitAnswer(realGameId, currentIndex, word, newScore).catch(() => { });
        } else {
            submitAnswer(realGameId, currentIndex, status === 'timeout' ? "TIMEOUT" : "WRONG", score).catch(() => { });
        }

        const currentAnswerDetail = {
            word: word,
            isCorrect: isCorrect,
            userAnswer: isCorrect ? word : (status === 'timeout' ? "Waktu Habis ⏰" : "Salah ❌"),
            time: (data?.gameJson?.timeLimit ? Number(data.gameJson.timeLimit) : 30) - timeLeft
        };

        const newBreakdown = [...breakdown, currentAnswerDetail];
        setBreakdown(newBreakdown);

        setTimeout(() => {
            if (currentIndex < quizWords.length - 1) {
                if (onIntermission) onIntermission();
                setCurrentIndex(prev => prev + 1);
                setUsed([]);
                setGuess("");
                setLives(6);
                setFeedback('none');
                setTimeLeft(data?.gameJson?.timeLimit ? Number(data.gameJson.timeLimit) : 30);
                isBusy.current = false;
            } else {
                handleFinish(isCorrect ? score + earnedPoints : score, newBreakdown);
            }
        }, 2000);
    };

    const handleFinish = async (finalScore: number, finalBreakdown: any[]) => {
        if (isSavingRef.current) return;

        isSavingRef.current = true;
        setIsFinished(true);
        const correctCount = finalBreakdown.filter(b => b.isCorrect).length;
        const accuracy = quizWords.length > 0 ? Math.round((correctCount / quizWords.length) * 100) : 0;

        const finalPayload = {
            scoreValue: finalScore,
            maxScore: quizWords.length * 150,
            accuracy,
            timeSpent: totalTimeRef.current,
            answersDetail: finalBreakdown,
        };

        sessionStorage.setItem("lastScore", finalScore.toString());
        sessionStorage.setItem("lastAccuracy", accuracy.toString());
        sessionStorage.setItem("lastBreakdown", JSON.stringify(finalBreakdown));

        if (onGameOver) {
            onGameOver(finalScore, accuracy, finalBreakdown);
            return;
        }

        try {
            await finishGame(realGameId, finalPayload);
        } catch (e) {
            console.error("Gagal simpan skor akhir");
        }

        navigate("/student/result", { state: finalPayload });
    };

    const submitGuess = () => {
        if (feedback !== 'none' || isFinished || isBusy.current) return;
        const char = guess.trim().toUpperCase();
        
        if (!char) return;
        if (used.includes(char)) {
            toast.error(`Huruf "${char}" sudah dicoba! 😅`);
            setGuess("");
            return;
        }

        const newUsed = [...used, char];
        setUsed(newUsed);
        setGuess("");

        if (!word.includes(char)) {
            const newLives = lives - 1;
            setLives(newLives);
            if (newLives <= 0) handleEndTurn('lose');
        } else {
            const isComplete = word.split("").every((l: string) => newUsed.includes(l));
            if (isComplete) handleEndTurn('correct');
        }
    };

    if (quizWords.length === 0 || isFinished) return <div className="p-20 text-center font-black text-indigo-400">Memproses...</div>;

    return (
        <div className="flex flex-col items-center p-6 space-y-6 font-sans w-full max-w-2xl mx-auto select-none">
            {/* Play Instructions */}
            <div className="w-full bg-indigo-50/75 backdrop-blur-md border border-indigo-100 rounded-2xl p-4 text-center">
                <p className="text-xs font-bold text-indigo-950">
                    🤠 <span>Tebak kata rahasia dengan memasukkan satu per satu huruf tebakanmu sebelum nyawamu habis!</span>
                </p>
            </div>

            {/* HUD HEADER */}
            <div className="w-full flex justify-between items-center bg-slate-900/95 backdrop-blur-md p-5 rounded-[2rem] border border-slate-800 text-white">
                <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nyawa</span>
                    <div className="flex gap-0.5">
                        {[...Array(6)].map((_, i) => (
                            <span key={i} className={`text-xs transition-all duration-300 ${i < lives ? 'scale-100' : 'grayscale opacity-20 scale-75'}`}>❤️</span>
                        ))}
                    </div>
                </div>
                <div className={`px-5 py-1.5 rounded-full font-black text-base border ${timeLeft <= 10 ? 'text-rose-500 border-rose-500/20 bg-rose-500/10 animate-pulse' : 'text-indigo-300 border-indigo-500/10 bg-indigo-500/5'}`}>
                    ⏱️ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>
                <div className="text-right flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Skor</span>
                    <span className="text-indigo-400 font-black text-xl">{score}</span>
                </div>
            </div>

            {/* VISUAL HANGMAN CONTAINER */}
            <div className="flex justify-center items-center py-2">
                <svg className="w-40 h-44 stroke-slate-700 stroke-[5] fill-none stroke-linecap-round stroke-linejoin-round bg-slate-50 p-4 rounded-3xl border border-slate-100 shadow-inner">
                    {/* Gallows */}
                    <line x1="20" y1="130" x2="120" y2="130" className="stroke-slate-400" />
                    <line x1="45" y1="130" x2="45" y2="15" className="stroke-slate-400" />
                    <line x1="45" y1="15" x2="105" y2="15" className="stroke-slate-400" />
                    <line x1="105" y1="15" x2="105" y2="35" className="stroke-slate-400" />

                    {/* Head with neon touch */}
                    {lives <= 5 && <circle cx="105" cy="45" r="10" className="stroke-indigo-500 stroke-[4]" />}
                    {/* Body */}
                    {lives <= 4 && <line x1="105" y1="55" x2="105" y2="92" className="stroke-indigo-500" />}
                    {/* Left Arm */}
                    {lives <= 3 && <line x1="105" y1="65" x2="88" y2="52" className="stroke-indigo-500" />}
                    {/* Right Arm */}
                    {lives <= 2 && <line x1="105" y1="65" x2="122" y2="52" className="stroke-indigo-500" />}
                    {/* Left Leg */}
                    {lives <= 1 && <line x1="105" y1="92" x2="88" y2="115" className="stroke-indigo-500" />}
                    {/* Right Leg */}
                    {lives === 0 && <line x1="105" y1="92" x2="122" y2="115" className="stroke-rose-500 stroke-[4]" />}
                </svg>
            </div>

            {/* HINT AREA */}
            <div className="text-center w-full max-w-lg">
                <div className="bg-white border-2 border-indigo-50 px-6 py-4 rounded-2xl shadow-sm">
                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block mb-1">Petunjuk</span>
                    <p className="text-slate-800 font-bold italic text-lg leading-relaxed">"{currentData?.hint}"</p>
                </div>
            </div>

            {/* WORD DISPLAY */}
            <div className="flex flex-wrap justify-center gap-2">
                {word.split("").map((l: string, i: number) => {
                    const isRevealed = used.includes(l) || feedback === 'timeout' || feedback === 'lose';
                    return (
                        <div key={i} className={`w-10 h-12 border-b-4 flex items-center justify-center text-2xl font-black transition-all duration-300 ${used.includes(l) ? 'border-indigo-500 text-indigo-600' :
                            (feedback === 'timeout' || feedback === 'lose') ? 'border-rose-400 text-rose-500' : 'border-slate-200 text-transparent'
                            }`}>
                            {isRevealed ? l : ""}
                        </div>
                    );
                })}
            </div>

            {/* GUESSED LETTERS HISTORY */}
            <div className="flex flex-col items-center gap-2 w-full max-w-lg">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Huruf yang telah dicoba</span>
                <div className="flex flex-wrap justify-center gap-1.5 min-h-[32px]">
                    {used.length === 0 ? (
                        <span className="text-slate-300 italic text-xs">Belum ada tebakan</span>
                    ) : (
                        used.map((char, i) => (
                            <span key={i} className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs border ${word.includes(char) ? 'bg-emerald-50 border-emerald-200 text-emerald-600 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-400 line-through opacity-70'}`}>
                                {char}
                            </span>
                        ))
                    )}
                </div>
            </div>

            {/* INPUT AREA */}
            <div className="w-full max-w-xs space-y-3">
                <input
                    className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl text-center text-3xl font-black focus:border-indigo-500 focus:bg-white outline-none uppercase transition-all"
                    maxLength={1}
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submitGuess()}
                    disabled={feedback !== 'none'}
                    placeholder="Masukkan Huruf"
                />
                <button
                    onClick={submitGuess}
                    disabled={feedback !== 'none' || !guess.trim()}
                    className="w-full py-4 rounded-2xl font-black text-base bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/10 active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all border border-indigo-500/20"
                >
                    TEBAK! 🚀
                </button>
            </div>
        </div>
    );
}