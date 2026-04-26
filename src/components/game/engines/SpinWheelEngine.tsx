import { useState, useEffect, useCallback, useRef } from "react";
import socket from "../../../hooks/useSocket";
import { submitAnswer, finishGame } from "../../../pages/services/game.service";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function SpinWheelEngine({ data, onIntermission, onGameOver }: { data: any, onIntermission?: any, onGameOver?: any }) {
    const questions = data?.gameJson?.questions || [];
    // 🎯 KRUSIAL: Pastikan mengambil ID asli untuk menghindari Error 500
    const realGameId = data?.id || data?._id;
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
                    handleTimeOut();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [completedCount]);

    const handleTimeOut = () => {
        processResult(false, "TIMEOUT");
    };

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

    const checkAnswer = () => {
        if (!selectedQuestion || isAnswered || isBusy.current) return;
        const isCorrect = userInput.trim().toLowerCase() === selectedQuestion.answer.trim().toLowerCase();
        processResult(isCorrect, userInput);
    };

    const processResult = async (isCorrect: boolean, finalInput: string) => {
        // 1. Matikan timer & kunci input segera
        if (timerRef.current) clearInterval(timerRef.current);
        isBusy.current = true;
        setIsAnswered(true);

        let newScore = score;
        let newLives = lives;

        // 2. Tampilkan Pop-up DULUAN sebelum API call
        if (isCorrect) {
            toast.success("BENAR! +100 Skor 🌟");
            newScore += 100;
            setScore(newScore);
        } else {
            newLives -= 1;
            setLives(newLives);
            if (finalInput === "TIMEOUT") {
                toast.error("Waktu Habis! ⏰");
            } else {
                toast.error(`SALAH! Jawaban: ${selectedQuestion.answer} ❌`);
            }
        }

        const newHistory = [...history, {
            word: finalInput,
            isCorrect,
            time: 15 - timeLeft
        }];
        setHistory(newHistory);

        // 3. Kirim ke backend (Gunakan try-catch agar tidak mematikan game jika server error)
        try {
            await submitAnswer(realGameId, questions.indexOf(selectedQuestion), finalInput, newScore);
        } catch (e) {
            console.warn("⚠️ Gagal update ranking ke server, tapi game tetap lanjut.");
        }

        const isGameOver = newLives <= 0 || completedCount + 1 >= questions.length;

        // 4. Navigasi otomatis
        setTimeout(() => {
            if (isGameOver) {
                handleFinishGame(newScore, newHistory);
            } else {
                if (onIntermission) onIntermission();
                setCompletedCount(prev => prev + 1);
                setIsAnswered(false);
                setSelectedQuestion(null);
                isBusy.current = false;
            }
        }, 2000);
    };

    const handleFinishGame = async (finalScore: number, finalHistory: any[]) => {
        const accuracy = Math.round((finalScore / (questions.length * 100)) * 100);
        const payload = {
            scoreValue: finalScore,
            maxScore: questions.length * 100,
            accuracy: accuracy,
            timeSpent: 0,
            answersDetail: finalHistory,
        };

        sessionStorage.setItem("lastScore", finalScore.toString());
        sessionStorage.setItem("lastAccuracy", accuracy.toString());
        sessionStorage.setItem("lastBreakdown", JSON.stringify(finalHistory));

        try {
            await finishGame(realGameId, payload);
        } catch (e) { console.error("Final save failed"); }

        if (onGameOver) {
            onGameOver(finalScore, accuracy, finalHistory);
        } else {
            navigate("/student/result", { state: payload });
        }
    };

    useEffect(() => {
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, []);

    if (questions.length === 0) return null;

    return (
        <div className="flex flex-col items-center p-6 space-y-10 max-w-xl mx-auto font-sans select-none">
            {/* HUD HEADER */}
            <div className="w-full flex justify-between bg-white p-6 rounded-[2.5rem] shadow-sm border-2 border-indigo-50 z-20">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nyawa</span>
                    <span className="text-xl">{"❤️".repeat(Math.max(0, lives))}</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Waktu</span>
                    <span className={`text-2xl font-black ${timeLeft <= 5 && timeLeft > 0 ? 'text-rose-500 animate-pulse' : 'text-slate-700'}`}>
                        {selectedQuestion && !isAnswered ? `${timeLeft}s` : "--"}
                    </span>
                </div>
                <div className="text-right">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Skor</span>
                    <p className="font-black text-indigo-600 text-2xl">{score}</p>
                </div>
            </div>

            {/* WHEEL VISUAL */}
            <div className="relative">
                <div
                    className="w-64 h-64 md:w-80 md:h-80 rounded-full border-[12px] border-slate-900 shadow-2xl overflow-hidden flex items-center justify-center bg-slate-100 transition-transform duration-[3000ms] cubic-bezier(0.15, 0, 0.15, 1)"
                    style={{ transform: `rotate(${rotation}deg)` }}
                >
                    {questions.map((_: any, i: number) => (
                        <div key={i} className="absolute w-full h-full" style={{ transform: `rotate(${(360 / questions.length) * i}deg)` }}>
                            <div className="h-1/2 w-1 mx-auto bg-slate-300 opacity-30 origin-bottom" />
                        </div>
                    ))}
                    <div className="absolute w-12 h-12 bg-slate-900 rounded-full z-10 flex items-center justify-center text-white font-black shadow-lg border-4 border-white">GO</div>
                </div>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-4xl z-20 animate-bounce">👇</div>
            </div>

            {!selectedQuestion ? (
                <div className="w-full space-y-4">
                    <button
                        onClick={spinWheel}
                        disabled={spinning || lives <= 0}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 py-6 rounded-[2.5rem] font-black text-white text-xl shadow-2xl transition-all active:scale-95 uppercase italic"
                    >
                        {spinning ? "Berputar..." : "Putar Roda! 🚀"}
                    </button>
                    <p className="text-center text-slate-400 font-black text-[10px] uppercase tracking-widest">Progress: {completedCount} / {questions.length}</p>
                </div>
            ) : (
                <div className="w-full bg-white p-8 rounded-[3.5rem] shadow-xl border-2 border-indigo-50 animate-in zoom-in duration-500 text-center space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-1 bg-indigo-500 transition-all duration-1000" style={{ width: `${(timeLeft / 15) * 100}%` }} />
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Pertanyaan Anda:</p>
                        <h3 className="text-2xl font-black text-slate-800 leading-tight italic">"{selectedQuestion.question}"</h3>
                    </div>

                    <input
                        type="text"
                        disabled={isAnswered}
                        autoFocus
                        className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl text-center font-black text-xl outline-none focus:border-indigo-500 focus:bg-white transition-all uppercase"
                        placeholder="Ketik Jawaban..."
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
                    />

                    <button
                        onClick={checkAnswer}
                        disabled={isAnswered}
                        className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-600 transition-all disabled:opacity-50"
                    >
                        {isAnswered ? "Memproses..." : "Kirim Jawaban 📩"}
                    </button>
                </div>
            )}
        </div>
    );
}