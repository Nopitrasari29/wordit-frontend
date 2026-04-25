import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../../../hooks/useSocket";
import { submitAnswer, finishGame } from "../../../pages/services/game.service";

export default function HangmanEngine({ data, onIntermission }: { data: any, onIntermission?: () => void }) {
    const navigate = useNavigate();

    const quizWords = useMemo(() => {
        const json = data?.gameJson;
        if (Array.isArray(json)) return json[0]?.words || [];
        return json?.words || [];
    }, [data]);

    const gameId = data?.id || "";
    const roomCode = data?.shareCode || "";

    const [currentIndex, setCurrentIndex] = useState(0);
    const [used, setUsed] = useState<string[]>([]);
    const [guess, setGuess] = useState("");
    const [lives, setLives] = useState(6);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [breakdown, setBreakdown] = useState<any[]>([]);
    const [timeLeft, setTimeLeft] = useState(30);
    const [feedback, setFeedback] = useState<'none' | 'correct' | 'incorrect' | 'timeout' | 'lose'>('none');

    const correctCountRef = useRef(0);
    const totalTimeRef = useRef(0);

    const currentData = quizWords[currentIndex];
    const word = currentData?.word?.toUpperCase() || "";

    useEffect(() => {
        if (feedback !== 'none' || isFinished || quizWords.length === 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleEndTurn('timeout');
                    return 0;
                }
                return prev - 1;
            });
            totalTimeRef.current += 1;
        }, 1000);

        return () => clearInterval(timer);
    }, [currentIndex, feedback, isFinished, quizWords.length]);

    const handleEndTurn = (status: 'correct' | 'timeout' | 'lose') => {
        setFeedback(status);
        const isCorrect = status === 'correct';

        if (isCorrect) {
            correctCountRef.current += 1;
            const points = 100 + (lives * 20) + (timeLeft * 5);
            const newScore = score + points;
            setScore(newScore);

            if (roomCode) socket.emit("updateScore", { code: roomCode, score: newScore });
            if (gameId) submitAnswer(gameId, currentIndex, word, points).catch(e => console.error(e));
        }

        setBreakdown(prev => [...prev, {
            word,
            isCorrect,
            time: 30 - timeLeft,
            livesRemaining: lives
        }]);

        setTimeout(() => {
            if (onIntermission && currentIndex < quizWords.length - 1) onIntermission();
            setTimeout(() => moveToNext(isCorrect), onIntermission ? 3000 : 0);
        }, 2000);
    };

    const moveToNext = (_isCorrect: boolean) => {
        if (currentIndex < quizWords.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setUsed([]);
            setGuess("");
            setLives(6);
            setFeedback('none');
            setTimeLeft(30);
        } else {
            handleFinish();
        }
    };

    const handleFinish = async () => {
        setIsFinished(true);
        const accuracy = Math.round((correctCountRef.current / quizWords.length) * 100);

        const finalPayload = {
            scoreValue: score,
            maxScore: quizWords.length * 400,
            accuracy,
            timeSpent: totalTimeRef.current,
            answersDetail: breakdown,
        };

        if (gameId) {
            try {
                await finishGame(gameId, finalPayload);
            } catch (e) {
                console.error("finishGame error:", e);
            }
        }
        navigate("/student/result", { state: finalPayload });
    };

    const submitGuess = () => {
        if (feedback !== 'none' || isFinished) return;
        const char = guess.trim().toUpperCase();
        if (!char || used.includes(char)) return;

        const newUsed = [...used, char];
        setUsed(newUsed);
        setGuess("");

        if (!word.includes(char)) {
            const newLives = lives - 1;
            setLives(newLives);
            if (newLives <= 0) {
                handleEndTurn('lose');
                return;
            }
            const el = document.getElementById("hangman-input");
            el?.classList.add("animate-shake", "border-rose-500");
            setTimeout(() => el?.classList.remove("animate-shake", "border-rose-500"), 500);
        } else {
            const isComplete = word.split("").every((l: string) => newUsed.includes(l));
            if (isComplete) handleEndTurn('correct');
        }
    };

    if (quizWords.length === 0 || isFinished) {
        return <div className="p-20 text-center font-black text-indigo-400 animate-pulse uppercase">Memproses Game... 🔄</div>;
    }

    return (
        <div className={`flex flex-col items-center p-8 space-y-8 font-sans w-full max-w-2xl mx-auto transition-all duration-500 rounded-[3rem] ${feedback === 'correct' ? 'bg-emerald-50' :
                feedback === 'lose' || feedback === 'timeout' ? 'bg-rose-50' : 'bg-transparent'
            }`}>
            <div className="w-full flex justify-between items-center px-4">
                <div className="flex flex-col gap-1">
                    <div className="bg-white border-2 border-slate-100 px-4 py-1 rounded-full font-black text-slate-400 text-[10px] uppercase tracking-widest">
                        Kata {currentIndex + 1} / {quizWords.length}
                    </div>
                    <div className="flex gap-1">
                        {[...Array(6)].map((_: any, i: number) => (
                            <span key={i} className={`transition-all duration-500 ${i < lives ? 'scale-100' : 'grayscale opacity-20 scale-75'}`}>❤️</span>
                        ))}
                    </div>
                </div>
                <div className={`px-6 py-2 rounded-full font-black text-lg border-2 ${timeLeft <= 10 ? 'bg-rose-100 text-rose-600 border-rose-200 animate-pulse' : 'bg-white text-indigo-600 border-indigo-50'}`}>
                    ⏱️ 00:{timeLeft.toString().padStart(2, '0')}
                </div>
            </div>

            <div className="text-center space-y-4 w-full">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Petunjuk</p>
                <div className="bg-white border-4 border-indigo-50 px-8 py-6 rounded-[2.5rem] shadow-sm">
                    <p className="text-indigo-900 font-black italic text-2xl">"{currentData?.hint}"</p>
                </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
                {word.split("").map((l: string, i: number) => {
                    const isRevealed = used.includes(l) || feedback === 'timeout' || feedback === 'lose';
                    return (
                        <div key={i} className={`w-12 h-14 border-b-8 flex items-center justify-center text-3xl font-black transition-all duration-500 ${used.includes(l) ? 'border-indigo-500 text-indigo-600' :
                                (feedback === 'timeout' || feedback === 'lose') ? 'border-rose-300 text-rose-400' : 'border-slate-100 text-transparent'
                            }`}>
                            {isRevealed ? l : ""}
                        </div>
                    );
                })}
            </div>

            <div className="w-full max-w-xs space-y-4">
                <input
                    id="hangman-input"
                    className="w-full bg-slate-50 border-4 border-slate-100 p-6 rounded-[2.5rem] text-center text-4xl font-black focus:border-indigo-500 outline-none uppercase transition-all"
                    maxLength={1}
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submitGuess()}
                    disabled={feedback !== 'none'}
                    autoFocus
                />
                <button
                    onClick={submitGuess}
                    disabled={feedback !== 'none'}
                    className={`w-full py-5 rounded-[2.5rem] font-black text-xl transition-all shadow-lg text-white ${feedback === 'none' ? 'bg-indigo-600 hover:bg-indigo-500 active:scale-95' : 'bg-slate-300'
                        }`}
                >
                    {feedback === 'none' ? 'TEBAK! 🚀' : 'LANJUT...'}
                </button>
            </div>
        </div>
    );
}