import { useState, useRef } from "react";
import socket from "../../../hooks/useSocket";
import { submitAnswer, finishGame } from "../../../pages/services/game.service";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function SpinWheelEngine({ data }: { data: any }) {
    const questions = data?.gameJson?.questions || [];
    const gameId = data?.id || data?._id;
    const roomCode = data?.shareCode || "";
    const navigate = useNavigate();

    const [spinning, setSpinning] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
    const [userInput, setUserInput] = useState("");
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [completedCount, setCompletedCount] = useState(0);
    const [rotation, setRotation] = useState(0);
    const [timeSpent, setTimeSpent] = useState(0);

    const spinWheel = () => {
        if (spinning || questions.length === 0) return;

        setSpinning(true);
        setSelectedQuestion(null);
        setUserInput("");
        setIsAnswered(false);

        const extraSpins = 5 + Math.floor(Math.random() * 5); // 5-10 putaran
        const randomIndex = Math.floor(Math.random() * questions.length);
        const degreePerItem = 360 / questions.length;
        const finalRotation = rotation + (extraSpins * 360) + (randomIndex * degreePerItem);

        setRotation(finalRotation);

        setTimeout(() => {
            setSpinning(false);
            setSelectedQuestion(questions[randomIndex]);
        }, 3000); // Durasi animasi 3 detik
    };

    const checkAnswer = async () => {
        if (!selectedQuestion || isAnswered) return;

        const isCorrect = userInput.trim().toLowerCase() === selectedQuestion.answer.trim().toLowerCase();

        if (isCorrect) {
            toast.success("BENAR! +100 Skor 🌟");
            const newScore = score + 100;
            setScore(newScore);

            if (roomCode) socket.emit("updateScore", { code: roomCode, score: newScore });
        } else {
            toast.error(`SALAH! Jawaban yang benar adalah: ${selectedQuestion.answer} ❌`);
        }

        setIsAnswered(true);
        setCompletedCount(prev => prev + 1);

        // Submit progres ke backend
        try {
            await submitAnswer(gameId, questions.indexOf(selectedQuestion), userInput, isCorrect ? 100 : 0);
        } catch (e) {
            console.error(e);
        }

        // Cek jika sudah semua soal diputar
        if (completedCount + 1 >= questions.length) {
            setTimeout(() => handleFinishGame(score + (isCorrect ? 100 : 0)), 2000);
        }
    };

    const handleFinishGame = async (finalScore: number) => {
        const payload = {
            scoreValue: finalScore,
            maxScore: questions.length * 100,
            accuracy: Math.round((finalScore / (questions.length * 100)) * 100),
            timeSpent: 0, // Bisa ditambahkan timer jika perlu
            answersDetail: questions.map(() => ({ isCorrect: true })), // Dummy detail
        };
        await finishGame(gameId, payload);
        navigate("/student/result", { state: payload });
    };

    return (
        <div className="flex flex-col items-center p-6 space-y-10 max-w-xl mx-auto font-sans min-h-screen">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-slate-800 italic uppercase">Spin & Guess 🎡</h2>
                <p className="text-indigo-500 font-black text-[10px] tracking-widest uppercase">Progress: {completedCount} / {questions.length}</p>
            </div>

            {/* WHEEL VISUAL */}
            <div className="relative">
                <div
                    className="w-64 h-64 md:w-80 md:h-80 rounded-full border-[12px] border-slate-900 shadow-2xl overflow-hidden flex items-center justify-center bg-slate-100 transition-transform duration-[3000ms] cubic-bezier(0.15, 0, 0.15, 1)"
                    style={{ transform: `rotate(${rotation}deg)` }}
                >
                    {questions.map((_: any, i: number) => (
                        <div
                            key={i}
                            className="absolute w-full h-full"
                            style={{ transform: `rotate(${(360 / questions.length) * i}deg)` }}
                        >
                            <div className="h-1/2 w-1 mx-auto bg-slate-300 opacity-30 origin-bottom" />
                        </div>
                    ))}
                    <div className="absolute w-12 h-12 bg-slate-900 rounded-full z-10 flex items-center justify-center text-white font-black shadow-lg border-4 border-white">
                        GO
                    </div>
                </div>
                {/* Pointer */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-4xl z-20 animate-bounce">👇</div>
            </div>

            {!selectedQuestion ? (
                <button
                    onClick={spinWheel}
                    disabled={spinning}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 py-6 rounded-[2.5rem] font-black text-white text-xl shadow-2xl transition-all active:scale-95 shadow-indigo-500/30"
                >
                    {spinning ? "BERPUTAR..." : "PUTAR RODA! 🚀"}
                </button>
            ) : (
                <div className="w-full bg-white p-8 rounded-[3.5rem] shadow-xl border-2 border-indigo-50 animate-in zoom-in duration-500 text-center space-y-6">
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pertanyaan Anda:</p>
                        <h3 className="text-2xl font-black text-slate-800 leading-tight">"{selectedQuestion.question}"</h3>
                    </div>

                    <input
                        type="text"
                        disabled={isAnswered}
                        className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl text-center font-black text-xl outline-none focus:border-indigo-500 focus:bg-white transition-all uppercase"
                        placeholder="Ketik Jawaban..."
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
                    />

                    {!isAnswered ? (
                        <button
                            onClick={checkAnswer}
                            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-600 transition-all"
                        >
                            Kirim Jawaban 📩
                        </button>
                    ) : (
                        <button
                            onClick={spinWheel}
                            className="w-full bg-indigo-50 text-indigo-600 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-100 transition-all"
                        >
                            Lanjut Spin 🔄
                        </button>
                    )}
                </div>
            )}

            {/* Score HUD */}
            <div className="fixed top-8 right-8 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black shadow-2xl border-2 border-slate-700">
                SCORE: {score}
            </div>
        </div>
    );
}