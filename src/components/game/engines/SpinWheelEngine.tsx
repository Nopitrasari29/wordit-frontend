import { useState, useCallback, useRef, useEffect } from "react";
import { submitAnswer, finishGame } from "../../../pages/services/game.service";
import socket from "../../../hooks/useSocket"; // 🎯 Import socket untuk sinkronisasi Teacher
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function SpinWheelEngine({ data, onIntermission, onGameOver }: { data: any, onIntermission?: any, onGameOver?: any }) {
    const questions = data?.gameJson?.questions || [];
    const realGameId = data?.id || data?._id;
    const roomCode = data?.shareCode || ""; // 🎯 Ambil kode ruangan
    const navigate = useNavigate();

    const [spinning, setSpinning] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
    const [userInput, setUserInput] = useState("");
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [completedCount, setCompletedCount] = useState(0);
    const [rotation, setRotation] = useState(0);
    const [timeLeft, setTimeLeft] = useState(15);
    const [history, setHistory] = useState<any[]>([]);

    const isBusy = useRef(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const startTimer = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        setTimeLeft(15);
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    handleResult(false, "TIMEOUT");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [completedCount]);

    const spinWheel = () => {
        if (spinning || isBusy.current || lives <= 0 || completedCount >= questions.length) return;
        setSpinning(true);
        setSelectedQuestion(null);
        setUserInput("");
        setIsAnswered(false);
        isBusy.current = false;

        const extraSpins = 5 + Math.floor(Math.random() * 5);
        const randomIndex = Math.floor(Math.random() * questions.length);
        const degreePerItem = 360 / questions.length;
        const finalRotation = rotation + (extraSpins * 360) + (randomIndex * degreePerItem);

        setRotation(finalRotation);
        setTimeout(() => {
            setSpinning(false);
            setSelectedQuestion(questions[randomIndex]);
            startTimer();
        }, 3000);
    };

    const handleResult = async (isCorrect: boolean, finalInput: string) => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (isBusy.current) return;
        isBusy.current = true;
        setIsAnswered(true);

        // 🎯 HITUNG SKOR BARU SECARA LOKAL AGAR PENGIRIMAN TIDAK DELAY
        const newScore = isCorrect ? score + 100 : score;
        const newLives = isCorrect ? lives : lives - 1;

        if (isCorrect) {
            setScore(newScore);
            toast.success("BENAR! +100 Skor 🌟");

            // 📡 SINKRONISASI KE TEACHER (REAL-TIME)
            if (roomCode) socket.emit("updateScore", { code: roomCode, score: newScore });
        } else {
            setLives(newLives);
            toast.error(finalInput === "TIMEOUT" ? "Waktu Habis! ⏰" : "Salah Jawaban! ❌");
        }

        const currentHistoryItem = { word: finalInput, isCorrect, time: 15 - timeLeft };
        const updatedHistory = [...history, currentHistoryItem];
        setHistory(updatedHistory);

        // Kirim ke backend (Hanya 4 argumen)
        submitAnswer(realGameId, questions.indexOf(selectedQuestion), finalInput, newScore).catch(() => { });

        setTimeout(() => {
            const isGameOver = newLives <= 0 || completedCount + 1 >= questions.length;
            if (isGameOver) {
                const accuracy = Math.round((newScore / (questions.length * 100)) * 100);
                const payload = {
                    scoreValue: newScore,
                    maxScore: questions.length * 100,
                    accuracy,
                    timeSpent: 0,
                    answersDetail: updatedHistory
                };

                // 🎯 SIMPAN KE STORAGE UNTUK REDUNDANSI
                sessionStorage.setItem("lastScore", newScore.toString());
                sessionStorage.setItem("lastAccuracy", accuracy.toString());
                sessionStorage.setItem("lastBreakdown", JSON.stringify(updatedHistory));

                finishGame(realGameId, payload).catch(() => { });
                if (onGameOver) onGameOver(newScore, accuracy, updatedHistory);
                else navigate("/student/result", { state: payload });
            } else {
                if (onIntermission) onIntermission();
                setCompletedCount(prev => prev + 1);
                setIsAnswered(false);
                setSelectedQuestion(null);
                isBusy.current = false;
            }
        }, 2000);
    };

    // Cleanup timer on unmount
    useEffect(() => {
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, []);

    if (questions.length === 0) return null;

    return (
        <div className="flex flex-col items-center p-6 space-y-10 max-w-xl mx-auto font-sans select-none">
            <div className="w-full flex justify-between bg-white p-6 rounded-[2.5rem] shadow-sm border-2 border-indigo-50">
                <div className="flex flex-col text-center items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nyawa</span>
                    <span>{"❤️".repeat(Math.max(0, lives))}</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Waktu</span>
                    <span className={`text-2xl font-black ${timeLeft <= 5 && timeLeft > 0 ? 'text-rose-500 animate-pulse' : 'text-slate-700'}`}>
                        {selectedQuestion && !isAnswered ? `${timeLeft}s` : "--"}
                    </span>
                </div>
                <div className="text-right flex flex-col font-black">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">Skor</span>
                    <p className="text-indigo-600 text-2xl">{score}</p>
                </div>
            </div>

            <div className="relative">
                <div
                    className="w-64 h-64 md:w-80 md:h-80 rounded-full border-[12px] border-slate-900 shadow-2xl transition-transform duration-[3000ms] cubic-bezier(0.15, 0, 0.15, 1)"
                    style={{
                        transform: `rotate(${rotation}deg)`,
                        background: 'conic-gradient(#6366f1 0deg 72deg, #818cf8 72deg 144deg, #6366f1 144deg 216deg, #818cf8 216deg 288deg, #6366f1 288deg 360deg)'
                    }}
                />
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-4xl animate-bounce">👇</div>
            </div>

            {!selectedQuestion ? (
                <button
                    onClick={spinWheel}
                    disabled={spinning || lives <= 0}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 text-white py-6 rounded-[2.5rem] font-black text-xl uppercase shadow-xl transition-all active:scale-95"
                >
                    {spinning ? "BERPUTAR..." : "PUTAR RODA! 🚀"}
                </button>
            ) : (
                <div className="w-full bg-white p-8 rounded-[3.5rem] shadow-xl border-2 border-indigo-50 text-center space-y-6 animate-in zoom-in duration-300">
                    <h3 className="text-2xl font-black italic text-slate-800">"{selectedQuestion.question}"</h3>
                    <input
                        type="text"
                        disabled={isAnswered}
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleResult(userInput.trim().toLowerCase() === selectedQuestion.answer.toLowerCase(), userInput)}
                        className="w-full bg-slate-50 border-4 border-slate-100 p-5 rounded-2xl text-center font-black text-xl uppercase outline-none focus:border-indigo-500 transition-all"
                        placeholder="Ketik Jawaban..."
                        autoFocus
                    />
                </div>
            )}
        </div>
    );
}