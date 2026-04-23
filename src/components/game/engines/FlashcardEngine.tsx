import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import socket from "../../../hooks/useSocket"
import { submitAnswer, finishGame } from "../../../pages/services/game.service"

export default function FlashcardEngine({ data, onIntermission }: { data: any, onIntermission?: () => void }) {
    const navigate = useNavigate()
    const cards = data?.gameJson?.cards || []
    const gameId = data?.id || ""
    const roomCode = data?.shareCode || ""

    const [index, setIndex] = useState(0)
    const [show, setShow] = useState(false)
    const [score, setScore] = useState(0)
    const [isFinished, setIsFinished] = useState(false)
    const [, setBreakdown] = useState<any[]>([])
    const card = cards[index]

    // Timer per kartu
    const [timeLeft, setTimeLeft] = useState(15)

    useEffect(() => {
        if (isFinished || cards.length === 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    moveToNext();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [index, isFinished, cards.length])

    function moveToNext() {
        setShow(false);
        const points = 10 + timeLeft; // Bonus jika baca cepat
        const newScore = score + points;
        setScore(newScore);

        // 💾 SIMPAN LANGSUNG KE SESSION
        sessionStorage.setItem("lastScore", newScore.toString());
        sessionStorage.setItem("lastAccuracy", "100"); // Flashcard selalu 100%

        const currentTimeSpent = 15 - timeLeft;
        setBreakdown(prev => {
            const newBd = [...prev, { word: card.front, isCorrect: true, time: currentTimeSpent }];
            if (index >= cards.length - 1) {
                sessionStorage.setItem("lastBreakdown", JSON.stringify(newBd));
            }
            return newBd;
        });

        if (roomCode) {
            socket.emit("updateScore", { code: roomCode, score: newScore });
        }

        if (gameId) {
            submitAnswer(gameId, index, "READ", points).catch(e => console.error(e));
        }

        if (index < cards.length - 1) {
            if (onIntermission) onIntermission();
            setTimeout(() => {
                setIndex(index + 1);
                setTimeLeft(15);
            }, onIntermission ? 3000 : 0);
        } else {
            setIsFinished(true);
            sessionStorage.setItem("lastScore", newScore.toString());
            sessionStorage.setItem("lastAccuracy", "100");

            // ✅ SIMPAN SKOR FINAL KE DATABASE
            if (gameId) {
                finishGame(gameId, {
                    scoreValue: newScore,
                    maxScore: cards.length * 25,
                    accuracy: 100,
                    timeSpent: cards.length * 15,
                    answersDetail: [], // Flashcard tidak punya breakdown jawaban salah
                }).catch(e => console.error("finishGame error:", e));
            }

            navigate("/student/result", { state: { score: newScore, accuracy: 100 } });
        }
    }

    if (cards.length === 0) return (
        <div className="p-20 text-center text-slate-400 font-black italic uppercase tracking-widest">
            🎴 Belum ada kartu...
        </div>
    )

    if (isFinished) {
        return (
            <div className="flex flex-col items-center justify-center p-10 text-indigo-400 font-black italic">
                <div className="animate-spin text-4xl mb-4">🔄</div>
                Menyimpan progres membaca...
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center p-6 space-y-10 font-sans w-full max-w-2xl mx-auto transition-all duration-500 rounded-[3rem]">
            
            {/* Header & Timer */}
            <div className="w-full flex justify-between items-center mb-0 px-4">
                <div className="bg-slate-100 px-6 py-2 rounded-full font-black text-slate-400 shadow-sm text-xs tracking-widest uppercase">
                    Kartu {index + 1} / {cards.length}
                </div>
                <div className={`flex items-center gap-2 px-6 py-2 rounded-full font-black text-lg shadow-sm border-2 ${timeLeft <= 5 ? 'bg-rose-100 text-rose-600 border-rose-200 animate-pulse' : 'bg-white text-indigo-600 border-indigo-50'}`}>
                    ⏱️ 00:{timeLeft.toString().padStart(2, '0')}
                </div>
            </div>

            <div className="text-center">
                <h2 className="text-4xl font-black text-slate-800 tracking-tighter italic">Flashcards 🎴</h2>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mt-2">Ketuk kartu untuk melihat jawaban</p>
            </div>

            <div
                onClick={() => setShow(!show)}
                className={`w-full aspect-[4/3] flex items-center justify-center p-12 rounded-[4rem] shadow-2xl cursor-pointer transition-all duration-700 transform ${
                    show ? 'bg-indigo-600 text-white rotate-1 scale-105' : 'bg-white text-slate-800 border-[12px] border-indigo-50 hover:shadow-indigo-100'
                }`}
            >
                <h3 className={`text-3xl md:text-5xl font-black text-center leading-tight transition-all duration-300 ${show ? 'scale-110' : ''}`}>
                    {show ? card.back : card.front}
                </h3>
            </div>

            <div className="flex items-center gap-6 w-full">
                <button
                    onClick={() => setShow(!show)}
                    className="flex-1 bg-slate-900 text-white px-8 py-5 rounded-[2rem] font-black hover:bg-slate-800 transition-all active:scale-95 shadow-xl"
                >
                    Flip Card 🔄
                </button>
                <button
                    onClick={moveToNext}
                    className="flex-1 bg-indigo-600 text-white px-8 py-5 rounded-[2rem] font-black hover:bg-indigo-500 shadow-xl shadow-indigo-100 transition-all active:scale-95"
                >
                    Next Card ➔
                </button>
            </div>
        </div>
    )
}