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
    const [timeLeft, setTimeLeft] = useState(30);
    const [feedback, setFeedback] = useState<'none' | 'correct' | 'incorrect' | 'timeout' | 'lose'>('none');
    const timerRef = useRef<any>(null);
    const totalTimeRef = useRef(0);
    const isSavingRef = useRef(false);
    const isBusy = useRef(false);

    const currentData = quizWords[currentIndex];
    const word = currentData?.word?.toUpperCase() || "";

    // 1. Timer Logic (Reset per soal)
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
            // Hitung poin: Base 100 + Bonus Nyawa + Bonus Waktu
            earnedPoints = 100 + (lives * 10);
            const newScore = score + earnedPoints;
            setScore(newScore);

            // 📡 Update Teacher via Socket (Agar sinkron real-time)
            if (roomCode) {

            const currentAccuracy =
                Math.round(
                    (
                        (breakdown.filter(
                            b => b.isCorrect
                        ).length + 1)
                        /
                        (currentIndex + 1)
                    ) * 100
                );

            socket.emit(
                "updateScore",
                {
                    code: roomCode,
                    score: newScore,
                    accuracy:
                        currentAccuracy,
                    progress:
                        `${currentIndex + 1}/${quizWords.length}`,
                }
            );
        }

            // 📡 Simpan ke DB (Update skor akumulasi)
            submitAnswer(realGameId, currentIndex, word, newScore).catch(() => { });
        } else {
            // Jika salah/timeout, tetap kirim skor terakhir agar tidak error
            submitAnswer(realGameId, currentIndex, status === 'timeout' ? "TIMEOUT" : "WRONG", score).catch(() => { });
        }

        // 🎯 FIX: Pastikan SEMUA kondisi (Benar/Salah/Timeout) masuk ke breakdown
        const currentAnswerDetail = {
            word: word,
            isCorrect: isCorrect,
            // Menentukan label tampilan di Riwayat Jawaban
            userAnswer: isCorrect ? word : (status === 'timeout' ? "Waktu Habis ⏰" : "Salah ❌"),
            time: 30 - timeLeft
        };

        // Langsung masukkan ke array breakdown
        const newBreakdown = [...breakdown, currentAnswerDetail];
        setBreakdown(newBreakdown);

        // Transisi ke soal berikutnya atau selesai
        setTimeout(() => {
            if (currentIndex < quizWords.length - 1) {
                if (onIntermission) onIntermission();
                setCurrentIndex(prev => prev + 1);
                setUsed([]);
                setGuess("");
                setLives(6);
                setFeedback('none');
                setTimeLeft(30);
                isBusy.current = false;
            } else {
                // Kirim breakdown terbaru yang sudah lengkap ke handleFinish
                handleFinish(isCorrect ? score + earnedPoints : score, newBreakdown);
            }
        }, 2000);
    };

    const handleFinish = async (finalScore: number, finalBreakdown: any[]) => {
        if (
            isSavingRef.current
        ) return;

        isSavingRef.current =
        true;
        setIsFinished(true);
        const correctCount = finalBreakdown.filter(b => b.isCorrect).length;
        const accuracy =
        quizWords.length > 0
        ? Math.round(
            (correctCount /
            quizWords.length) * 100
        )
        : 0;

        const finalPayload = {
            scoreValue: finalScore,
            maxScore: quizWords.length * 150, // Estimasi max score
            accuracy,
            timeSpent: totalTimeRef.current,
            answersDetail: finalBreakdown,
        };

        // Redundansi simpan ke storage
        sessionStorage.setItem(
            "lastScore",
            finalScore.toString()
        );

        sessionStorage.setItem(
            "lastAccuracy",
            accuracy.toString()
        );

        sessionStorage.setItem(
            "lastBreakdown",
            JSON.stringify(
                finalBreakdown
            )
        );

        if (onGameOver) {

            onGameOver(
                finalScore,
                accuracy,
                finalBreakdown
            );

            return;
        }

        try {
            await finishGame(
                realGameId,
                finalPayload
            );
        } catch (e) {
            console.error(
                "Gagal simpan skor akhir"
            );
        }

        navigate(
            "/student/result",
            {
                state: finalPayload
            }
        );
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
            // Cek apakah semua huruf sudah tertebak
            const isComplete = word.split("").every((l: string) => newUsed.includes(l));
            if (isComplete) handleEndTurn('correct');
        }
    };

    if (quizWords.length === 0 || isFinished) return <div className="p-20 text-center font-black">Memproses...</div>;

    return (
        <div className="flex flex-col items-center p-8 space-y-8 font-sans w-full max-w-2xl mx-auto">
            {/* HUD HEADER */}
            <div className="w-full flex justify-between items-center bg-white p-6 rounded-[2.5rem] shadow-sm border-2 border-indigo-50">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nyawa</span>
                    <div className="flex gap-1">
                        {[...Array(6)].map((_, i) => (
                            <span key={i} className={`transition-all duration-500 ${i < lives ? 'scale-100' : 'grayscale opacity-20 scale-75'}`}>❤️</span>
                        ))}
                    </div>
                </div>
                <div className={`px-6 py-2 rounded-full font-black text-lg border-2 ${timeLeft <= 10 ? 'text-rose-600 border-rose-200 animate-pulse' : 'text-indigo-600 border-indigo-50'}`}>
                    ⏱️ {timeLeft}s
                </div>
                <div className="text-right flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Skor</span>
                    <span className="text-indigo-600 font-black text-2xl">{score}</span>
                </div>
            </div>

            {/* VISUAL HANGMAN SVG */}
            <div className="flex justify-center items-center">
                <svg className="w-40 h-48 stroke-slate-700 stroke-[5] fill-none stroke-linecap-round stroke-linejoin-round bg-slate-50 p-4 rounded-3xl border border-slate-100 shadow-inner">
                    {/* Gallows */}
                    <line x1="20" y1="150" x2="120" y2="150" />
                    <line x1="50" y1="150" x2="50" y2="20" />
                    <line x1="50" y1="20" x2="110" y2="20" />
                    <line x1="110" y1="20" x2="110" y2="40" />

                    {/* Head */}
                    {lives <= 5 && <circle cx="110" cy="52" r="12" className="stroke-indigo-600 stroke-[4]" />}
                    {/* Body */}
                    {lives <= 4 && <line x1="110" y1="64" x2="110" y2="105" className="stroke-indigo-600" />}
                    {/* Left Arm */}
                    {lives <= 3 && <line x1="110" y1="75" x2="90" y2="60" className="stroke-indigo-600" />}
                    {/* Right Arm */}
                    {lives <= 2 && <line x1="110" y1="75" x2="130" y2="60" className="stroke-indigo-600" />}
                    {/* Left Leg */}
                    {lives <= 1 && <line x1="110" y1="105" x2="90" y2="130" className="stroke-indigo-600" />}
                    {/* Right Leg */}
                    {lives === 0 && <line x1="110" y1="105" x2="130" y2="130" className="stroke-rose-500" />}
                </svg>
            </div>

            {/* HINT AREA */}
            <div className="text-center space-y-4 w-full">
                <div className="bg-white border-4 border-indigo-50 px-8 py-6 rounded-[2.5rem] shadow-sm">
                    <p className="text-indigo-900 font-black italic text-2xl">"{currentData?.hint}"</p>
                </div>
            </div>

            {/* WORD DISPLAY */}
            <div className="flex flex-wrap justify-center gap-3">
                {word.split("").map((l: string, i: number) => {
                    const isRevealed = used.includes(l) || feedback === 'timeout' || feedback === 'lose';
                    return (
                        <div key={i} className={`w-12 h-14 border-b-8 flex items-center justify-center text-3xl font-black transition-all duration-500 ${used.includes(l) ? 'border-indigo-500 text-indigo-600' :
                            (feedback === 'timeout' || feedback === 'lose') ? 'border-rose-300 text-rose-400' : 'border-slate-300 text-transparent'
                            }`}>
                            {isRevealed ? l : ""}
                        </div>
                    );
                })}
            </div>

            {/* GUESSED LETTERS HISTORY */}
            <div className="flex flex-col items-center gap-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Huruf yang sudah dicoba:</span>
                <div className="flex flex-wrap justify-center gap-2">
                    {used.length === 0 && <span className="text-slate-300 italic text-xs">Belum ada tebakan</span>}
                    {used.map((char, i) => (
                        <span key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm border-2 ${word.includes(char) ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-400 line-through'}`}>
                            {char}
                        </span>
                    ))}
                </div>
            </div>

            {/* INPUT AREA */}
            <div className="w-full max-w-xs space-y-4">

                <input
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
                    className="w-full py-5 rounded-[2.5rem] font-black text-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:bg-slate-200"
                >
                    TEBAK! 🚀
                </button>
            </div>
        </div>
    );
}