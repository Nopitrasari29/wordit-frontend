import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import socket from "../../../hooks/useSocket"
import { submitAnswer } from "../../../pages/services/game.service"

export default function WordSearchEngine({ data }: { data: any, onIntermission?: () => void }) {
    const navigate = useNavigate()
    const quizWords = data?.gameJson?.words || []
    const wordsOnly = quizWords.map((w: any) => w.word.toUpperCase())
    const gameId = data?.id || ""
    const roomCode = data?.shareCode || ""

    const [foundWords, setFoundWords] = useState<string[]>([])
    const [score, setScore] = useState(0)
    const [isFinished, setIsFinished] = useState(false)

    // Global Timer: 15 detik per kata target
    const [timeLeft, setTimeLeft] = useState(quizWords.length > 0 ? quizWords.length * 15 : 60)

    useEffect(() => {
        if (isFinished || quizWords.length === 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleFinish(foundWords);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isFinished, quizWords.length, foundWords])

    function handleFinish(finalFoundWords: string[]) {
        setIsFinished(true);
        const accuracy = Math.round((finalFoundWords.length / quizWords.length) * 100);
        
        const newBreakdown = wordsOnly.map((w: string) => ({
            word: w,
            isCorrect: finalFoundWords.includes(w),
            time: null
        }));

        sessionStorage.setItem("lastScore", score.toString());
        sessionStorage.setItem("lastAccuracy", accuracy.toString());
        sessionStorage.setItem("lastBreakdown", JSON.stringify(newBreakdown));

        setTimeout(() => {
            navigate("/student/result", { state: { score, accuracy } });
        }, 1500);
    }

    if (quizWords.length === 0) return (
        <div className="p-20 text-center text-slate-400 font-black italic uppercase tracking-widest">
            🔍 Belum ada kata...
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

    return (
        <div className="flex flex-col items-center p-10 space-y-12 font-sans w-full max-w-3xl mx-auto">
            {/* Header & Timer */}
            <div className="w-full flex justify-between items-center mb-0 px-4">
                <div className="bg-slate-100 px-6 py-2 rounded-full font-black text-slate-400 shadow-sm text-xs tracking-widest uppercase">
                    Target: {foundWords.length} / {wordsOnly.length}
                </div>
                <div className={`flex items-center gap-2 px-6 py-2 rounded-full font-black text-lg shadow-sm border-2 ${timeLeft <= 10 ? 'bg-rose-100 text-rose-600 border-rose-200 animate-pulse' : 'bg-white text-indigo-600 border-indigo-50'}`}>
                    ⏱️ {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>
            </div>

            <div className="text-center mt-0">
                <h2 className="text-4xl font-black text-slate-800 tracking-tighter italic">Find the Words 🔍</h2>
                <p className="text-indigo-400 font-black uppercase tracking-[0.3em] text-[10px] mt-2 text-center">Cari kata-kata di bawah pada grid</p>
            </div>

            <div className="grid grid-cols-5 gap-3 bg-white p-8 rounded-[4rem] shadow-2xl border-[12px] border-indigo-50">
                {Array.from({ length: 25 }).map((_, i) => (
                    <div key={i} className="w-14 h-14 bg-slate-50 text-slate-300 font-black flex items-center justify-center rounded-2xl text-2xl hover:bg-indigo-600 hover:text-white hover:scale-110 transition-all cursor-pointer shadow-inner">
                        {String.fromCharCode(65 + Math.floor(Math.random() * 26))}
                    </div>
                ))}
            </div>

            <div className="w-full bg-slate-900 p-10 rounded-[4rem] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
                <p className="text-white/40 font-black text-[10px] uppercase mb-6 text-center tracking-[0.4em]">Daftar Target:</p>
                <div className="flex flex-wrap justify-center gap-4">
                    {wordsOnly.map((w: string, index: number) => {
                        const isFound = foundWords.includes(w);
                        return (
                            <div
                                key={w}
                                onClick={async () => {
                                    if (isFound) return;
                                    
                                    const newFound = [...foundWords, w];
                                    setFoundWords(newFound);
                                    
                                    const points = 100 + (Math.floor(timeLeft / 5) * 10);
                                    const newScore = score + points;
                                    setScore(newScore);

                                    // 💾 SIMPAN LANGSUNG KE SESSION
                                    sessionStorage.setItem("lastScore", newScore.toString());
                                    const runningAccuracy = Math.round((newFound.length / wordsOnly.length) * 100);
                                    sessionStorage.setItem("lastAccuracy", runningAccuracy.toString());

                                    // 📡 Emit live score
                                    if (roomCode) {
                                        socket.emit("updateScore", { code: roomCode, score: newScore });
                                    }

                                    // 💾 Simpan progres
                                    if (gameId) {
                                        submitAnswer(gameId, index, w, points).catch(e => console.error(e));
                                    }

                                    // Cek apakah game selesai
                                    if (newFound.length === wordsOnly.length) {
                                        handleFinish(newFound);
                                    }
                                }}
                                className={`px-8 py-3 rounded-full font-black text-lg border-2 backdrop-blur-sm transition-all cursor-pointer ${
                                    isFound 
                                        ? "bg-emerald-500 text-white border-emerald-400 scale-105" 
                                        : "bg-white/10 text-white border-white/10 hover:bg-white hover:text-slate-900 hover:-translate-y-1"
                                }`}
                            >
                                {w} {isFound && "✅"}
                            </div>
                        );
                    })}
                </div>
                
                {/* Tampilkan Skor */}
                <div className="absolute top-6 right-8 bg-indigo-600 px-4 py-2 rounded-xl border-2 border-indigo-500 font-black text-white text-sm">
                    Skor: {score}
                </div>
            </div>
        </div>
    )
}