import { useState, useMemo, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import socket from "../../../hooks/useSocket"
import { submitAnswer, finishGame } from "../../../pages/services/game.service"

export default function AnagramEngine({ data, onIntermission, onGameOver }: { data: any, onIntermission?: () => void, onGameOver?: (score: number, accuracy: number, breakdown: any[]) => void }) {
    const navigate = useNavigate()
    const quizWords = data?.gameJson?.words || []
    const gameId = data?.id || ""
    const roomCode = data?.shareCode || data?.code || ""
    
    const [currentIndex, setCurrentIndex] = useState(0)
    const [answer, setAnswer] = useState("")
    const [score, setScore] = useState(0)
    const [isFinished, setIsFinished] = useState(false)
    const [breakdown, setBreakdown] = useState<any[]>([])
    const [usedIndices, setUsedIndices] = useState<number[]>([])

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
                osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
                osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
                osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
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
    const [timeLeft, setTimeLeft] = useState(15)
    const [feedback, setFeedback] = useState<'none' | 'correct' | 'incorrect' | 'timeout'>('none')
    const correctCountRef = useRef(0)

    const startTimeRef = useRef<number>(Date.now())

    const currentQuestion = quizWords[currentIndex]
    const targetWord = currentQuestion?.word?.toUpperCase() || ""

    const shuffled = useMemo(() => {
        if (!targetWord) return []
        const letters = targetWord.split("")
        for (let i = letters.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [letters[i], letters[j]] = [letters[j], letters[i]]
        }
        if (letters.join("") === targetWord && targetWord.length > 1) {
            return targetWord.split("").reverse()
        }
        return letters
    }, [targetWord, currentIndex])

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
    }, [currentIndex, feedback, isFinished, quizWords.length])

    function handleTimeout() {
        playSound('timeout');
        setFeedback('timeout');
        setUsedIndices([]);
        setBreakdown(prev => [...prev, { word: targetWord, isCorrect: false, time: 15 }]);
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
            setTimeLeft(15);
        } else {
            setIsFinished(true);
            const accuracy = Math.round((correctCountRef.current / quizWords.length) * 100);
            const finalBreakdown = breakdown;
            const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);

            const payload = {
                scoreValue: score,
                maxScore: quizWords.length * 250, // max 100 base + 150 time bonus
                accuracy,
                timeSpent,
                answersDetail: finalBreakdown,
            };

            // Simpan ke session untuk antisipasi jika ter-refresh
            sessionStorage.setItem("lastScore", score.toString());
            sessionStorage.setItem("lastAccuracy", accuracy.toString());
            sessionStorage.setItem("lastBreakdown", JSON.stringify(finalBreakdown));

            // ✅ SIMPAN SKOR FINAL KE DATABASE (1x di akhir game)
            if (onGameOver) {
                onGameOver(
                    score,
                    accuracy,
                    finalBreakdown
                );
                return;
            }

            if (gameId) {
                finishGame(
                    gameId,
                    payload
                ).catch(e =>
                    console.error(
                        "finishGame error:",
                        e
                    )
                );
            }

            navigate(
                "/student/result",
                {
                    state: payload,
                }
            );
    }

    if (!quizWords || quizWords.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-10 text-slate-400 font-bold italic">
                <div className="animate-spin text-4xl mb-4">⌛</div>
                Menyiapkan arena permainan...
            </div>
        )
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

            // 💾 SIMPAN LANGSUNG KE SESSION (Buat jaga-jaga kalau host End Session mendadak)
            sessionStorage.setItem("lastScore", newScore.toString());
            const runningAccuracy = Math.round((correctCountRef.current / quizWords.length) * 100);
            sessionStorage.setItem("lastAccuracy", runningAccuracy.toString());

            const currentTimeSpent = 15 - timeLeft;
            setBreakdown(prev => {
                const newBd = [...prev, { word: targetWord, isCorrect: true, time: currentTimeSpent }];
                if (currentIndex === quizWords.length - 1) {
                    sessionStorage.setItem("lastBreakdown", JSON.stringify(newBd));
                }
                return newBd;
            });

            if (roomCode) {
                const runningAccuracy =
                    Math.round(
                        (correctCountRef.current /
                            (currentIndex + 1)) *
                        100
                    );

                socket.emit(
                    "updateScore",
                    {
                        code: roomCode,
                        score: newScore,
                        accuracy:
                            runningAccuracy,
                        progress:
                            `${currentIndex + 1}/${quizWords.length}`,
                    }
                );
            }

            if (gameId) {
                submitAnswer(gameId, currentIndex, answer.toUpperCase(), points).catch(err => console.error("Submit Error:", err));
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
        )
    }

    // Dynamic UI Styling based on feedback
    let containerClass = "flex flex-col items-center justify-center p-6 space-y-8 font-sans w-full max-w-2xl mx-auto transition-all duration-500 rounded-[3rem]"
    let inputClass = "w-full max-w-md border-4 px-6 py-4 rounded-3xl text-center text-2xl font-black outline-none transition-all uppercase "
    
    if (feedback === 'correct') {
        containerClass += " bg-emerald-50 scale-105"
        inputClass += " bg-emerald-100 border-emerald-400 text-emerald-700"
    } else if (feedback === 'incorrect') {
        containerClass += " bg-rose-50 animate-shake"
        inputClass += " bg-rose-100 border-rose-400 text-rose-700 placeholder:text-rose-300"
    } else if (feedback === 'timeout') {
        containerClass += " bg-amber-50 scale-95 opacity-80"
        inputClass += " bg-amber-100 border-amber-400 text-amber-700"
    } else {
        containerClass += " bg-transparent"
        inputClass += " bg-slate-50 border-slate-100 text-slate-700 focus:border-indigo-500 focus:bg-white placeholder:normal-case placeholder:font-medium placeholder:text-slate-300"
    }

    return (
        <div className={containerClass}>
            
            {/* Header & Timer */}
            <div className="w-full flex justify-between items-center mb-4 px-4">
                <div className="bg-white border-2 border-slate-100 px-6 py-2 rounded-full font-black text-slate-400 shadow-sm text-xs tracking-widest uppercase">
                    Soal {currentIndex + 1} / {quizWords.length}
                </div>
                <div className={`flex items-center gap-2 px-6 py-2 rounded-full font-black text-lg shadow-sm border-2 ${timeLeft <= 5 ? 'bg-rose-100 text-rose-600 border-rose-200 animate-pulse' : 'bg-white text-indigo-600 border-indigo-50'}`}>
                    ⏱️ 00:{timeLeft.toString().padStart(2, '0')}
                </div>
            </div>

            <div className="text-center">
                <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-4">Arrange the Letters 🧩</h2>
                <p className="text-indigo-600 font-black bg-indigo-50 px-6 py-3 rounded-2xl border-2 border-indigo-100 italic shadow-inner">
                    " {currentQuestion?.hint || "Tidak ada petunjuk"} "
                </p>
            </div>

            {/* Letter Blocks */}
            <div className="flex flex-wrap justify-center gap-3">
                {shuffled.map((letter: string, i: number) => {
                    const isUsed = usedIndices.includes(i);
                    return (
                        <button 
                            key={`${currentIndex}-${i}`} 
                            disabled={feedback !== 'none' || isUsed}
                            onClick={() => handleLetterClick(letter, i)}
                            className={`w-14 h-14 md:w-16 md:h-16 border-4 rounded-2xl flex items-center justify-center text-3xl font-black shadow-sm transition-all
                                ${feedback === 'correct' ? 'bg-emerald-500 border-emerald-400 text-white scale-110' : 
                                  feedback === 'incorrect' ? 'bg-rose-50 border-rose-200 text-rose-600' :
                                  feedback === 'timeout' ? 'bg-amber-100 border-amber-200 text-amber-500 grayscale' :
                                  isUsed ? 'bg-slate-100 border-slate-200 text-slate-300 opacity-40 cursor-default scale-95' :
                                  'bg-white border-indigo-100 text-indigo-600 hover:bg-indigo-50 hover:scale-105 active:scale-95 animate-bounce'}`}
                            style={{ animationDelay: (feedback === 'none' && !isUsed) ? `${i * 0.1}s` : '0s' }}
                        >
                            {letter}
                        </button>
                    );
                })}
            </div>

            {/* Input & Action */}
            <div className="w-full flex flex-col items-center gap-4 relative">
                
                {/* Visual Feedback Badges */}
                {feedback === 'correct' && (
                    <div className="absolute -top-10 bg-emerald-500 text-white px-6 py-1 rounded-full font-black text-xs uppercase tracking-widest animate-bounce shadow-lg">
                        + {100 + (timeLeft * 10)} PTS!
                    </div>
                )}
                {feedback === 'incorrect' && (
                    <div className="absolute -top-10 bg-rose-500 text-white px-6 py-1 rounded-full font-black text-xs uppercase tracking-widest animate-pulse shadow-lg">
                        SALAH! COBA LAGI
                    </div>
                )}
                {feedback === 'timeout' && (
                    <div className="absolute -top-10 bg-amber-500 text-white px-6 py-1 rounded-full font-black text-xs uppercase tracking-widest animate-pulse shadow-lg">
                        WAKTU HABIS! ⌛
                    </div>
                )}

                <div className="w-full max-w-md flex gap-2">
                    <input
                        className={inputClass}
                        placeholder={feedback === 'timeout' ? "TIME'S UP" : "Ketik atau klik huruf..."}
                        autoFocus
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && submit()}
                        disabled={feedback !== 'none'}
                    />
                    <button
                        onClick={handleClear}
                        disabled={feedback !== 'none' || !answer}
                        className="bg-slate-200 hover:bg-slate-300 active:scale-95 text-slate-700 px-4 rounded-3xl font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                        title="Hapus Jawaban"
                    >
                        🧹 Clear
                    </button>
                </div>

                <button
                    onClick={submit}
                    disabled={feedback !== 'none'}
                    className={`font-black text-xl px-12 py-4 rounded-3xl transition-all uppercase tracking-widest text-white shadow-lg
                        ${feedback === 'none' 
                            ? 'bg-indigo-600 hover:bg-indigo-500 hover:-translate-y-1 active:translate-y-2' 
                            : 'bg-slate-300 cursor-not-allowed opacity-50'}`}
                >
                    {feedback === 'none' ? 'Kirim Jawaban! 🚀' : '⏳ Wait...'}
                </button>
            </div>

            <div className="bg-white border-2 border-slate-100 px-8 py-3 rounded-full font-black text-slate-500 shadow-sm text-sm">
                Skor: <span className="text-indigo-600 ml-2">{score}</span>
            </div>
        </div>
    )
    }
}