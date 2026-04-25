import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../../../hooks/useSocket";
import { submitAnswer, finishGame } from "../../../pages/services/game.service";
import { toast } from "react-hot-toast";

export default function FlashcardEngine({ data }: { data: any }) {
    const navigate = useNavigate();

    // Pastikan mengambil dari cards sesuai schema 
    const cards = data?.gameJson?.cards || [];
    const [index, setIndex] = useState(0);
    const [show, setShow] = useState(false);
    const [score, setScore] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [breakdown, setBreakdown] = useState<any[]>([]);
    const [timeSpent, setTimeSpent] = useState(0);

    const card = cards[index];

    // Timer untuk memenuhi field timeSpent di Result model 
    useEffect(() => {
        const timer = setInterval(() => setTimeSpent(prev => prev + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleEvaluation = async (isCorrect: boolean) => {
        setShow(false);
        const points = isCorrect ? 20 : 0; // Sesuai FlashcardService calculateScore
        const newScore = score + points;
        const newCorrectCount = isCorrect ? correctCount + 1 : correctCount;

        setScore(newScore);
        setCorrectCount(newCorrectCount);

        const currentAnswer = {
            question: card.front,
            userAnswer: isCorrect ? "Hafal" : "Lupa",
            correctAnswer: card.back,
            isCorrect: isCorrect
        };
        const newBreakdown = [...breakdown, currentAnswer];
        setBreakdown(newBreakdown);

        // BE-13: WebSocket Update 
        if (data.shareCode) {
            socket.emit("updateScore", { code: data.shareCode, score: newScore });
        }

        if (index < cards.length - 1) {
            setIndex(index + 1);
        } else {
            // BE-12: finishGame dengan payload lengkap sesuai Schema [cite: 17, 27]
            const payload = {
                scoreValue: newScore,
                maxScore: cards.length * 20,
                accuracy: Math.round((newCorrectCount / cards.length) * 100),
                timeSpent: timeSpent, // ✅ FIX error TS (Property missing)
                answersDetail: newBreakdown,
            };

            try {
                await finishGame(data.id, payload);
                navigate("/student/result", { state: payload });
            } catch (e) {
                toast.error("Gagal menyimpan hasil.");
                navigate("/student/result", { state: payload });
            }
        }
    };

    if (!card) return <div className="p-10 text-center">Data tidak ditemukan</div>;

    return (
        <div className="flex flex-col items-center justify-center p-6 space-y-8 max-w-2xl mx-auto">
            <div className="w-full flex justify-between px-4 font-black text-slate-400 text-xs">
                <span>KARTU {index + 1} / {cards.length}</span>
                <span>⏱️ {timeSpent}s</span>
            </div>

            <div
                onClick={() => setShow(!show)}
                className={`w-full aspect-[4/3] flex items-center justify-center p-12 rounded-[4rem] shadow-2xl cursor-pointer transition-all duration-500 transform ${show ? 'bg-indigo-600 text-white rotate-y-180' : 'bg-white text-slate-800 border-[12px] border-indigo-50'
                    }`}
            >
                <div className="text-center">
                    <h3 className="text-3xl md:text-5xl font-black leading-tight">
                        {show ? card.back : card.front}
                    </h3>
                </div>
            </div>

            {!show ? (
                <button onClick={() => setShow(true)} className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black shadow-xl">
                    BUKA JAWABAN 🔄
                </button>
            ) : (
                <div className="flex gap-4 w-full animate-in zoom-in">
                    <button onClick={() => handleEvaluation(false)} className="flex-1 bg-rose-500 text-white py-5 rounded-[2rem] font-black shadow-xl">
                        LUPA ❌
                    </button>
                    <button onClick={() => handleEvaluation(true)} className="flex-1 bg-emerald-500 text-white py-5 rounded-[2rem] font-black shadow-xl">
                        HAFAL ✅
                    </button>
                </div>
            )}
        </div>
    );
}