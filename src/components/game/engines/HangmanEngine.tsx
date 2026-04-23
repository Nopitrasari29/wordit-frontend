import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import socket from "../../../hooks/useSocket"
import { submitAnswer, finishGame } from "../../../pages/services/game.service"

export default function HangmanEngine({ data, onIntermission }: { data: any, onIntermission?: () => void }) {
    const navigate = useNavigate()
    const quizWords = data?.gameJson?.words || []
    const gameId = data?.id || ""
    const roomCode = data?.shareCode || ""
    
    const [currentIndex, setCurrentIndex] = useState(0)
    const [used, setUsed] = useState<string[]>([])
    const [guess, setGuess] = useState("")
    const [score, setScore] = useState(0)
    const [isFinished, setIsFinished] = useState(false)
    const [breakdown, setBreakdown] = useState<any[]>([])

    // Timer & UX State (30 detik per kata untuk Hangman)
    const [timeLeft, setTimeLeft] = useState(30)
    const [feedback, setFeedback] = useState<'none' | 'correct' | 'incorrect' | 'timeout'>('none')
    const correctCountRef = useRef(0)

    const currentData = quizWords[currentIndex]
    const word = currentData?.word?.toUpperCase() || ""

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
        setFeedback('timeout');
        setBreakdown(prev => [...prev, { word, isCorrect: false, time: 30 }]);
        setTimeout(() => {
            if (onIntermission && currentIndex < quizWords.length - 1) onIntermission();
            setTimeout(() => moveToNext(false), onIntermission ? 3000 : 0);
        }, 1500);
    }

    function moveToNext(isCorrect: boolean) {
        if (isCorrect) correctCountRef.current += 1;

        if (currentIndex < quizWords.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setUsed([]);
            setGuess("");
            setFeedback('none');
            setTimeLeft(30);
        } else {
            setIsFinished(true);
            const accuracy = Math.round((correctCountRef.current / quizWords.length) * 100);
            const finalBreakdown = breakdown;

            sessionStorage.setItem("lastScore", score.toString());
            sessionStorage.setItem("lastAccuracy", accuracy.toString());
            sessionStorage.setItem("lastBreakdown", JSON.stringify(finalBreakdown));

            // ✅ SIMPAN SKOR FINAL KE DATABASE (1x di akhir game)
            if (gameId) {
                finishGame(gameId, {
                    scoreValue: score,
                    maxScore: quizWords.length * 400,
                    accuracy,
                    timeSpent: quizWords.length * 30,
                    answersDetail: finalBreakdown,
                }).catch(e => console.error("finishGame error:", e));
            }

            navigate("/student/result", { state: { score, accuracy } });
        }
    }

    if (quizWords.length === 0) return (
        <div className="p-20 text-center text-slate-400 font-black italic uppercase tracking-widest flex flex-col items-center">
            <div className="animate-spin text-4xl mb-4">⌛</div>
            Menyiapkan arena Hangman...
        </div>
    )

    if (isFinished) {
        return (
            <div className="flex flex-col items-center justify-center p-10 text-indigo-400 font-black italic">
                <div className="animate-spin text-4xl mb-4">🔄</div>
                Menghitung skor akhir...
            </div>
        )
    }

    async function submit() {
        if (feedback !== 'none') return;
        const char = guess.trim().toUpperCase()
        if (!char || used.includes(char)) return
        
        const newUsed = [...used, char]
        setUsed(newUsed)
        setGuess("")

        const isComplete = word.split("").every((l: string) => newUsed.includes(l))
        
        if (isComplete) {
            setFeedback('correct');
            // Skor Hangman: Base 100 + Sisa Waktu * 10
            const points = 100 + (timeLeft * 10);
            const newScore = score + points;
            setScore(newScore);

            // 💾 SIMPAN LANGSUNG KE SESSION (Buat jaga-jaga kalau host End Session mendadak)
            sessionStorage.setItem("lastScore", newScore.toString());
            const runningAccuracy = Math.round((correctCountRef.current / quizWords.length) * 100);
            sessionStorage.setItem("lastAccuracy", runningAccuracy.toString());

            const currentTimeSpent = 30 - timeLeft;
            setBreakdown(prev => {
                const newBd = [...prev, { word, isCorrect: true, time: currentTimeSpent }];
                // Cek jika ini pertanyaan terakhir, kita harus simpan ke sessionStorage sekarang juga
                // karena moveToNext setTimeout bisa balapan dengan render terakhir
                if (currentIndex === quizWords.length - 1) {
                    sessionStorage.setItem("lastBreakdown", JSON.stringify(newBd));
                }
                return newBd;
            });

            if (roomCode) {
                socket.emit("updateScore", { code: roomCode, score: newScore });
            }

            if (gameId) {
                submitAnswer(gameId, currentIndex, word, points).catch(e => console.error(e));
            }

            setTimeout(() => {
                if (onIntermission && currentIndex < quizWords.length - 1) onIntermission();
                setTimeout(() => moveToNext(true), onIntermission ? 3000 : 0);
            }, 1500);
        } else if (!word.includes(char)) {
            // Visual feedback singkat kalau salah tebak huruf
            const inputEl = document.getElementById("hangman-input");
            if (inputEl) {
                inputEl.classList.add("bg-rose-100", "border-rose-400", "text-rose-700", "animate-shake");
                setTimeout(() => {
                    inputEl.classList.remove("bg-rose-100", "border-rose-400", "text-rose-700", "animate-shake");
                }, 500);
            }
        }
    }

    // Dynamic Styling
    let containerClass = "flex flex-col items-center p-8 space-y-10 font-sans w-full max-w-2xl mx-auto transition-all duration-500 rounded-[3rem]"
    
    if (feedback === 'correct') {
        containerClass += " bg-emerald-50 scale-105"
    } else if (feedback === 'timeout') {
        containerClass += " bg-amber-50 scale-95 opacity-80"
    } else {
        containerClass += " bg-transparent"
    }

    return (
        <div className={containerClass}>
            
            {/* Header & Timer */}
            <div className="w-full flex justify-between items-center mb-0 px-4">
                <div className="bg-white border-2 border-slate-100 px-6 py-2 rounded-full font-black text-slate-400 shadow-sm text-xs tracking-widest uppercase">
                    Kata {currentIndex + 1} / {quizWords.length}
                </div>
                <div className={`flex items-center gap-2 px-6 py-2 rounded-full font-black text-lg shadow-sm border-2 ${timeLeft <= 10 ? 'bg-rose-100 text-rose-600 border-rose-200 animate-pulse' : 'bg-white text-indigo-600 border-indigo-50'}`}>
                    ⏱️ 00:{timeLeft.toString().padStart(2, '0')}
                </div>
            </div>

            <div className="text-center space-y-4">
                <h2 className="text-4xl font-black text-slate-800 tracking-tighter italic">Hangman 🧗</h2>
                <div className="bg-amber-50 border-4 border-amber-100 px-8 py-4 rounded-[2.5rem] shadow-sm">
                    <p className="text-amber-700 font-black italic text-xl">"{currentData?.hint || "Cari katanya!"}"</p>
                </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 relative">
                {feedback === 'correct' && (
                    <div className="absolute -top-12 bg-emerald-500 text-white px-6 py-1 rounded-full font-black text-sm uppercase tracking-widest animate-bounce shadow-lg z-10">
                        + {100 + (timeLeft * 10)} PTS!
                    </div>
                )}
                {feedback === 'timeout' && (
                    <div className="absolute -top-12 bg-amber-500 text-white px-6 py-1 rounded-full font-black text-sm uppercase tracking-widest animate-pulse shadow-lg z-10">
                        WAKTU HABIS! ⌛
                    </div>
                )}

                {word.split("").map((l: string, i: number) => {
                    // Jika timeout, tampilkan sisa huruf dengan warna merah muda agar siswa tahu jawabannya
                    const isRevealed = used.includes(l) || feedback === 'timeout';
                    
                    return (
                        <div
                            key={i}
                            className={`w-14 h-16 border-b-[10px] flex items-center justify-center text-4xl font-black transition-all duration-500 ${
                                used.includes(l) ? 'border-indigo-500 text-indigo-600 scale-110' : 
                                feedback === 'timeout' ? 'border-rose-300 text-rose-400' :
                                'border-slate-200 text-transparent'
                            } ${feedback === 'correct' && 'text-emerald-500 border-emerald-400'}`}
                        >
                            {isRevealed ? l : ""}
                        </div>
                    )
                })}
            </div>

            <div className="w-full max-w-sm space-y-4">
                <input
                    id="hangman-input"
                    className="w-full bg-slate-50 border-4 border-slate-100 p-6 rounded-[2.5rem] text-center text-4xl font-black focus:border-indigo-500 focus:bg-white outline-none uppercase transition-all shadow-inner placeholder:text-slate-300"
                    maxLength={1}
                    placeholder={feedback === 'timeout' ? "TIME'S UP" : "?"}
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submit()}
                    disabled={feedback !== 'none'}
                    autoFocus
                />
                <button
                    onClick={submit}
                    disabled={feedback !== 'none'}
                    className={`w-full font-black py-5 rounded-[2.5rem] text-xl transition-all shadow-lg uppercase tracking-widest text-white
                        ${feedback === 'none' 
                            ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-100 active:scale-95' 
                            : 'bg-slate-300 cursor-not-allowed opacity-50'}`}
                >
                    {feedback === 'none' ? 'TEBAK HURUF! 🚀' : '⏳ Wait...'}
                </button>
            </div>

            <div className="w-full bg-white p-8 rounded-[3rem] border-2 border-slate-50 text-center relative shadow-sm">
                <div className="absolute top-4 right-8 font-black text-indigo-500 bg-indigo-50 px-4 py-1 rounded-full text-xs">
                    Skor: {score}
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-[0.2em]">History Huruf</p>
                <div className="flex gap-2 justify-center flex-wrap">
                    {used.map((u, i) => (
                        <span key={i} className="bg-slate-50 text-slate-400 px-4 py-2 rounded-xl font-black uppercase border border-slate-100">{u}</span>
                    ))}
                </div>
            </div>
        </div>
    )
}