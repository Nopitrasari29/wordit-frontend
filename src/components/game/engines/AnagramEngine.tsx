import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../../../hooks/useSocket";
import { submitAnswer, finishGame } from "../../../pages/services/game.service";

export default function AnagramEngine({ data, onIntermission, onGameOver }: { data: any, onIntermission?: () => void, onGameOver?: (score: number, accuracy: number, breakdown: any[]) => void }) {
    const navigate = useNavigate();
    const gameConfig = Array.isArray(data?.gameJson) ? data.gameJson[0] : data?.gameJson;
    const quizWords = gameConfig?.words || [];
    const gameId = data?.id || "";
    const roomCode = data?.shareCode || data?.code || "";
    
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answer, setAnswer] = useState("");
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [breakdown, setBreakdown] = useState<any[]>([]);
    const [usedIndices, setUsedIndices] = useState<number[]>([]);

    const playSound = (type: 'click' | 'correct' | 'incorrect' | 'timeout') => {
        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContextClass) return;
            const ctx = new AudioContextClass();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            if (type === 'click') {
                osc.frequency.setValueAtTime(500, ctx.currentTime);
                gain.gain.setValueAtTime(0.04, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
                osc.start();
                osc.stop(ctx.currentTime + 0.08);
            } else if (type === 'correct') {
                osc.frequency.setValueAtTime(523.25, ctx.currentTime);
                osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
                osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
                gain.gain.setValueAtTime(0.08, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
                osc.start();
                osc.stop(ctx.currentTime + 0.35);
            } else if (type === 'incorrect') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(130, ctx.currentTime);
                osc.frequency.setValueAtTime(100, ctx.currentTime + 0.12);
                gain.gain.setValueAtTime(0.08, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
                osc.start();
                osc.stop(ctx.currentTime + 0.25);
            } else if (type === 'timeout') {
                osc.frequency.setValueAtTime(220, ctx.currentTime);
                gain.gain.setValueAtTime(0.05, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
                osc.start();
                osc.stop(ctx.currentTime + 0.3);
            }
        } catch (e) {}
    };

    const handleLetterClick = (letter: string, idx: number) => {
        if (feedback !== 'none' || usedIndices.includes(idx)) return;
        playSound('click');
        setAnswer(prev => prev + letter);
        setUsedIndices(prev => [...prev, idx]);
    };

    const handleClear = () => {
        playSound('click');
        setAnswer("");
        setUsedIndices([]);
    };
    
    // Timer & UX State
    const [timeLeft, setTimeLeft] = useState(gameConfig?.timeLimit ? Number(gameConfig.timeLimit) : 15);
    const [feedback, setFeedback] = useState<'none' | 'correct' | 'incorrect' | 'timeout'>('none');
    const correctCountRef = useRef(0);

    const startTimeRef = useRef<number>(Date.now());

    const currentQuestion = quizWords[currentIndex];
    const targetWord = currentQuestion?.word?.toUpperCase() || "";

    const shuffled = useMemo(() => {
        if (!targetWord) return [];
        const letters = targetWord.split("");
        for (let i = letters.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [letters[i], letters[j]] = [letters[j], letters[i]];
        }
        if (letters.join("") === targetWord && targetWord.length > 1) {
            return targetWord.split("").reverse();
        }
        return letters;
    }, [targetWord, currentIndex]);

    // Timer Logic
    useEffect(() => {
        if (feedback !== 'none' || isFinished || quizWords.length === 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleTimeout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [currentIndex, feedback, isFinished, quizWords.length]);

    function handleTimeout() {
        playSound('timeout');
        setFeedback('timeout');
        setUsedIndices([]);
        setBreakdown(prev => [...prev, { word: targetWord, isCorrect: false, time: gameConfig?.timeLimit ? Number(gameConfig.timeLimit) : 15 }]);
        setTimeout(() => {
            if (onIntermission && currentIndex < quizWords.length - 1) onIntermission();
            setTimeout(() => moveToNext(), onIntermission ? 3000 : 0);
        }, 1500);
    }

    function moveToNext() {
        if (currentIndex < quizWords.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setAnswer("");
            setUsedIndices([]);
            setFeedback('none');
            setTimeLeft(gameConfig?.timeLimit ? Number(gameConfig.timeLimit) : 15);
        } else {
            setIsFinished(true);
            const accuracy = Math.round((correctCountRef.current / quizWords.length) * 100);
            const finalBreakdown = breakdown;
            const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);

            const payload = {
                scoreValue: score,
                maxScore: quizWords.length * 250,
                accuracy,
                timeSpent,
                answersDetail: finalBreakdown,
            };

            sessionStorage.setItem("lastScore", score.toString());
            sessionStorage.setItem("lastAccuracy", accuracy.toString());
            sessionStorage.setItem("lastBreakdown", JSON.stringify(finalBreakdown));

            if (onGameOver) {
                onGameOver(score, accuracy, finalBreakdown);
                return;
            }

            if (gameId) {
                finishGame(gameId, payload).catch(e =>
                    console.error("finishGame error:", e)
                );
            }

            navigate("/student/result", { state: payload });
        }
    }

    if (!quizWords || quizWords.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-10 text-slate-400 font-bold italic">
                <div className="animate-spin text-4xl mb-4">⌛</div>
                Menyiapkan arena permainan...
            </div>
        );
    }

    async function submit() {
        if (feedback !== 'none' || !answer.trim()) return;

        if (answer.toUpperCase() === targetWord) {
            playSound('correct');
            setFeedback('correct');
            correctCountRef.current += 1;
            
            const points = 100 + (timeLeft * 10);
            const newScore = score + points;
            setScore(newScore);

            sessionStorage.setItem("lastScore", newScore.toString());
            const runningAccuracy = Math.round((correctCountRef.current / quizWords.length) * 100);
            sessionStorage.setItem("lastAccuracy", runningAccuracy.toString());

            const currentTimeSpent = (gameConfig?.timeLimit ? Number(gameConfig.timeLimit) : 15) - timeLeft;
            setBreakdown(prev => {
                const newBd = [...prev, { word: targetWord, isCorrect: true, time: currentTimeSpent }];
                if (currentIndex === quizWords.length - 1) {
                    sessionStorage.setItem("lastBreakdown", JSON.stringify(newBd));
                }
                return newBd;
            });

            if (roomCode) {
                const runningAccuracy = Math.round((correctCountRef.current / (currentIndex + 1)) * 105);

                socket.emit("updateScore", {
                    code: roomCode,
                    score: newScore,
                    accuracy: runningAccuracy,
                    progress: `${currentIndex + 1}/${quizWords.length}`,
                });
            }

            if (gameId) {
                submitAnswer(gameId, currentIndex, answer.toUpperCase(), newScore).catch(err => console.error("Submit Error:", err));
            }

            setTimeout(() => {
                if (onIntermission && currentIndex < quizWords.length - 1) onIntermission();
                setTimeout(() => moveToNext(), onIntermission ? 3000 : 0);
            }, 1500);
        } else {
            playSound('incorrect');
            setFeedback('incorrect');
            setAnswer("");
            setUsedIndices([]);
            
            setTimeout(() => {
                setFeedback('none');
            }, 1500);
        }
    }

    if (isFinished) {
        return (
            <div className="flex flex-col items-center justify-center p-10 text-indigo-400 font-black italic">
                <div className="animate-spin text-4xl mb-4">🔄</div>
                Menghitung skor akhir...
            </div>
        );
    }

    let containerClass = "flex flex-col items-center justify-center p-6 space-y-6 font-sans w-full max-w-2xl mx-auto transition-all duration-500 rounded-[2.5rem]";
    let inputClass = "w-full max-w-md border-2 px-5 py-4 rounded-2xl text-center text-xl font-black outline-none transition-all uppercase ";
    
    if (feedback === 'correct') {
        containerClass += " bg-emerald-50/50 scale-102";
        inputClass += " bg-emerald-100 border-emerald-400 text-emerald-700";
    } else if (feedback === 'incorrect') {
        containerClass += " bg-rose-50/50 animate-shake";
        inputClass += " bg-rose-100 border-rose-400 text-rose-700 placeholder:text-rose-300";
    } else if (feedback === 'timeout') {
        containerClass += " bg-amber-50/50 scale-95 opacity-80";
        inputClass += " bg-amber-100 border-amber-400 text-amber-700";
    } else {
        containerClass += " bg-transparent";
        inputClass += " bg-slate-50 border-slate-200 text-slate-700 focus:border-indigo-500 focus:bg-white placeholder:normal-case placeholder:font-semibold placeholder:text-slate-300";
    }

    return (
        <div className={containerClass}>
            
            {/* Play Instructions */}
            <div className="w-full bg-indigo-50/75 backdrop-blur-md border border-indigo-100 rounded-2xl p-4 text-center">
                <p className="text-xs font-bold text-indigo-950">
                    🧩 <span>Susun kembali huruf-huruf acak di bawah untuk mencocokkan kata dengan petunjuk yang diberikan!</span>
                </p>
            </div>

            {/* Header & Timer */}
            <div className="w-full flex justify-between items-center px-4">
                <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 text-white px-5 py-2 rounded-full font-black text-[10px] tracking-widest uppercase shadow-sm">
                    Soal {currentIndex + 1} / {quizWords.length}
                </div>
                <div className={`flex items-center gap-2 px-5 py-1.5 rounded-full font-black text-base border ${timeLeft <= 5 ? 'text-rose-500 border-rose-500/20 bg-rose-500/10 animate-pulse' : 'text-indigo-300 border-indigo-500/10 bg-indigo-500/5'}`}>
                    ⏱️ 00:{timeLeft.toString().padStart(2, '0')}
                </div>
            </div>

            {/* Hint Panel */}
            <div className="text-center w-full max-w-lg">
                <div className="bg-white border-2 border-indigo-50 px-6 py-4 rounded-2xl shadow-sm">
                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block mb-1">Petunjuk Kata</span>
                    <p className="text-slate-800 font-bold italic text-lg leading-relaxed">
                        " {currentQuestion?.hint || "Tidak ada petunjuk"} "
                    </p>
                </div>
            </div>

            {/* Letter Blocks */}
            <div className="flex flex-wrap justify-center gap-2.5">
                {shuffled.map((letter: string, i: number) => {
                    const isUsed = usedIndices.includes(i);
                    return (
                        <button 
                            key={`${currentIndex}-${i}`} 
                            disabled={feedback !== 'none' || isUsed}
                            onClick={() => handleLetterClick(letter, i)}
                            className={`w-12 h-12 md:w-14 md:h-14 border-[3px] rounded-xl flex items-center justify-center text-2xl font-black shadow-sm transition-all
                                ${feedback === 'correct' ? 'bg-emerald-500 border-emerald-400 text-white scale-105' : 
                                  feedback === 'incorrect' ? 'bg-rose-50 border-rose-200 text-rose-600' :
                                  feedback === 'timeout' ? 'bg-amber-100 border-amber-200 text-amber-500 grayscale' :
                                  isUsed ? 'bg-slate-100 border-slate-200 text-slate-300 opacity-40 cursor-default scale-95' :
                                  'bg-white border-indigo-100 text-indigo-600 hover:bg-indigo-50/50 hover:scale-105 active:scale-95'}`}
                        >
                            {letter}
                        </button>
                    );
                })}
            </div>

            {/* Input & Action */}
            <div className="w-full flex flex-col items-center gap-4 relative max-w-md">
                {feedback === 'correct' && (
                    <div className="absolute -top-10 bg-emerald-500 text-white px-5 py-1 rounded-full font-black text-[10px] uppercase tracking-widest animate-bounce shadow-lg">
                        + {100 + (timeLeft * 10)} PTS!
                    </div>
                )}
                {feedback === 'incorrect' && (
                    <div className="absolute -top-10 bg-rose-500 text-white px-5 py-1 rounded-full font-black text-[10px] uppercase tracking-widest animate-pulse shadow-lg">
                        SALAH! COBA LAGI
                    </div>
                )}
                {feedback === 'timeout' && (
                    <div className="absolute -top-10 bg-amber-500 text-white px-5 py-1 rounded-full font-black text-[10px] uppercase tracking-widest animate-pulse shadow-lg">
                        WAKTU HABIS! ⌛
                    </div>
                )}

                <div className="w-full flex gap-2">
                    <input
                        className={inputClass}
                        placeholder={feedback === 'timeout' ? "TIME'S UP" : "Ketik / klik huruf..."}
                        autoFocus
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && submit()}
                        disabled={feedback !== 'none'}
                    />
                    <button
                        onClick={handleClear}
                        disabled={feedback !== 'none' || !answer}
                        className="bg-slate-200 hover:bg-slate-300 active:scale-95 text-slate-700 px-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50 border border-slate-350"
                        title="Hapus Jawaban"
                    >
                        🧹 Clear
                    </button>
                </div>

                <button
                    onClick={submit}
                    disabled={feedback !== 'none'}
                    className={`w-full font-black text-lg py-4 rounded-2xl transition-all uppercase tracking-widest text-white shadow-lg border
                        ${feedback === 'none' 
                            ? 'bg-indigo-600 hover:bg-indigo-500 hover:-translate-y-0.5 active:scale-98 shadow-indigo-600/10 border-indigo-500/20' 
                            : 'bg-slate-300 cursor-not-allowed opacity-50 border-slate-200'}`}
                >
                    {feedback === 'none' ? 'Kirim Jawaban! 🚀' : '⏳ Mohon tunggu...'}
                </button>
            </div>

            <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 text-white px-6 py-2 rounded-full font-black text-xs shadow-sm">
                Skor: <span className="text-indigo-400 ml-1">{score}</span>
            </div>
        </div>
    );
}