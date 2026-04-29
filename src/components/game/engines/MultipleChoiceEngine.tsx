import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { submitAnswer, finishGame } from "../../../pages/services/game.service";
import socket from "../../../hooks/useSocket";
import { toast } from "react-hot-toast";

export default function MultipleChoiceEngine({ data, onGameOver, onIntermission }: { data: any, onGameOver?: any, onIntermission?: () => void }) {
    const navigate = useNavigate();
    const realGameId = data?.id || data?._id;
    const roomCode = data?.shareCode || "";

    // 🧠 Parsing Data
    const gameConfig = useMemo(() => Array.isArray(data?.gameJson) ? data.gameJson[0] : data?.gameJson, [data]);
    const questions = useMemo(() => gameConfig?.questions || [], [gameConfig]);

    // 🎮 Game State
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    // Waktu dinamis: 15 detik per soal
    const [timeLeft, setTimeLeft] = useState(questions.length * 15);
    const [isFinished, setIsFinished] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [totalTimeSpent, setTotalTimeSpent] = useState(0);

    // ⏱️ Timer Logic
    useEffect(() => {
        if (questions.length === 0) return;

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    handleTimeUp();
                    return 0;
                }
                return prev - 1;
            });
            setTotalTimeSpent(prev => prev + 1);
        }, 1000);

        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [questions]);

    const handleTimeUp = () => {
        toast.error("Waktu Habis! ⏰");
        handleFinish(history);
    };

    const handleAnswer = (option: string) => {
        // Cegah klik dobel
        if (selectedOption || isFinished) return;
        setSelectedOption(option);

        const currentQ = questions[currentIndex];
        const isCorrect = option === currentQ.correctAnswer;

        // Kalkulasi Skor
        const newScore = score + (isCorrect ? 100 : 0);
        if (isCorrect) setScore(newScore);

        // Catat Riwayat Jawaban
        const answerRecord = {
            questionIndex: currentIndex,
            selectedAnswer: option,
            isCorrect
        };
        const newHistory = [...history, answerRecord];
        setHistory(newHistory);

        // Feedback Instan
        if (isCorrect) toast.success("Benar! 🎉");
        else toast.error("Salah! ❌");

        // 🚀 Realtime Update ke Socket & DB
        if (roomCode) socket.emit("updateScore", { code: roomCode, score: newScore });
        submitAnswer(realGameId, currentIndex, option, newScore).catch(() => { });

        // Jeda 1 detik biar siswa bisa lihat animasi benar/salah, lalu lanjut soal
        setTimeout(() => {
            setSelectedOption(null);
            if (currentIndex + 1 < questions.length) {
                if (onIntermission) onIntermission();
                setCurrentIndex(currentIndex + 1);
            } else {
                handleFinish(newHistory, newScore);
            }
        }, 1200);
    };

    const handleFinish = async (finalHistory: any[], finalScore = score) => {
        if (isFinished) return;
        setIsFinished(true);
        if (timerRef.current) clearInterval(timerRef.current);

        // Isi jawaban kosong jika waktu keburu habis (Menjawab Bug QA 5.B)
        let completeHistory = [...finalHistory];
        if (completeHistory.length < questions.length) {
            for (let i = completeHistory.length; i < questions.length; i++) {
                completeHistory.push({
                    questionIndex: i,
                    selectedAnswer: null,
                    isCorrect: false
                });
            }
        }

        const correctCount = completeHistory.filter(h => h.isCorrect).length;
        const accuracy = Math.round((correctCount / questions.length) * 100);

        const payload = {
            scoreValue: finalScore,
            maxScore: questions.length * 100,
            accuracy,
            timeSpent: totalTimeSpent,
            answersDetail: completeHistory,
        };

        sessionStorage.setItem("lastScore", finalScore.toString());
        sessionStorage.setItem("lastAccuracy", accuracy.toString());
        sessionStorage.setItem("lastBreakdown", JSON.stringify(payload.answersDetail));

        try {
            await finishGame(realGameId, payload);
        } catch (e) {
            console.error("Gagal simpan skor ke DB");
        }

        if (onGameOver) {
            onGameOver(finalScore, accuracy, payload.answersDetail);
        } else {
            navigate("/student/result", { state: payload });
        }
    };

    // UI Fallbacks
    if (questions.length === 0) return <div className="p-10 text-center text-slate-400 font-bold animate-pulse">Menyiapkan arena... 🏟️</div>;
    if (isFinished) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-widest text-indigo-600">Menyimpan Skor... 🏆</div>;

    const currentQ = questions[currentIndex];

    // Warna khas ala Kahoot untuk 4 opsi
    const optionColors = [
        "bg-rose-500 hover:bg-rose-600 border-rose-600",
        "bg-blue-500 hover:bg-blue-600 border-blue-600",
        "bg-amber-500 hover:bg-amber-600 border-amber-600",
        "bg-emerald-500 hover:bg-emerald-600 border-emerald-600"
    ];

    return (
        <div className="flex flex-col items-center p-4 md:p-6 space-y-6 max-w-4xl mx-auto font-sans w-full">

            {/* 1. HEADER (Stats bar) */}
            <div className="w-full flex justify-between bg-white p-4 md:p-6 rounded-[2rem] shadow-sm border-2 border-indigo-50 items-center">
                <div className="flex flex-col font-black text-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">Soal</span>
                    <span className="text-xl text-indigo-600">{currentIndex + 1} <span className="text-sm text-slate-300">/ {questions.length}</span></span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">Sisa Waktu</span>
                    <span className={`text-2xl font-black ${timeLeft <= 10 ? 'text-rose-500 animate-pulse' : 'text-slate-700'}`}>
                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </span>
                </div>
                <div className="text-center flex flex-col font-black">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">Skor</span>
                    <span className="text-indigo-600 text-2xl">{score}</span>
                </div>
            </div>

            {/* 2. QUESTION CARD */}
            <div className="w-full bg-white p-8 md:p-14 rounded-[3rem] shadow-xl border border-slate-100 text-center min-h-[250px] flex items-center justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <h2 className="text-2xl md:text-4xl font-black text-slate-800 leading-tight relative z-10">
                    {currentQ.question}
                </h2>
            </div>

            {/* 3. OPTIONS GRID (4 Kotak) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {currentQ.options.map((opt: string, i: number) => {
                    let btnStyle = optionColors[i % optionColors.length];

                    // Animasi saat opsi dipilih
                    if (selectedOption) {
                        if (opt === currentQ.correctAnswer) {
                            btnStyle = "bg-emerald-500 border-emerald-600 scale-105 z-10 shadow-2xl shadow-emerald-500/50"; // Yang benar membesar hijau
                        } else if (opt === selectedOption && opt !== currentQ.correctAnswer) {
                            btnStyle = "bg-rose-500 border-rose-600 opacity-80 scale-95"; // Yang salah mengecil merah
                        } else {
                            btnStyle = "bg-slate-200 border-slate-300 text-slate-400 opacity-50 grayscale"; // Sisanya redup
                        }
                    }

                    return (
                        <button
                            key={i}
                            disabled={selectedOption !== null}
                            onClick={() => handleAnswer(opt)}
                            className={`w-full text-left p-6 md:p-8 rounded-[2rem] border-b-8 font-black text-white text-xl md:text-2xl transition-all duration-300 active:scale-95 active:border-b-0 active:translate-y-2 flex items-center gap-4 ${btnStyle}`}
                        >
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0 shadow-inner">
                                {["A", "B", "C", "D"][i]}
                            </div>
                            <span className="drop-shadow-md leading-tight">{opt}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}