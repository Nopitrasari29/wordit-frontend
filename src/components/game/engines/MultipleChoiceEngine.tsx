import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { submitAnswer, finishGame } from "../../../pages/services/game.service";
import socket from "../../../hooks/useSocket";
import { toast } from "react-hot-toast";

interface GameAnswer {
    questionIndex: number;
    question: string;
    selectedAnswer: string | null;
    correctAnswer: string;
    isCorrect: boolean;
}

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
    const [timeLeft, setTimeLeft] = useState(gameConfig?.timeLimit ? Number(gameConfig.timeLimit) : questions.length * 15);
    const [isFinished, setIsFinished] = useState(false);

    // 🛠️ FIX: Gunakan useRef untuk history agar sinkron saat dipanggil di handleFinish
    const historyRef = useRef<GameAnswer[]>([]);
    // Tambahkan scoreRef agar nilai skor terbaru selalu tersedia secara sinkron
    const scoreRef = useRef(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [totalTimeSpent, setTotalTimeSpent] = useState(0);

    // ⏱️ Timer Logic
    useEffect(() => {
        if (questions.length === 0) return;

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current);
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
        // Gunakan historyRef terbaru dan scoreRef saat ini
        handleFinish(historyRef.current, scoreRef.current);
    };

    const handleAnswer = (option: string) => {
        // Cegah klik dobel
        if (selectedOption || isFinished) return;
        setSelectedOption(option);

        const currentQ = questions[currentIndex];
        const isCorrect = option === currentQ.correctAnswer;

        // Kalkulasi Skor
        const pointsEarned = isCorrect ? 100 : 0;
        const newScore = score + pointsEarned;

        setScore(newScore);
        scoreRef.current = newScore; // Update Ref agar sinkron

        // 🛠️ FIX: Catat Riwayat Jawaban ke Ref (Sinkron) dengan detail lengkap untuk Backend
        const answerRecord: GameAnswer = {
            questionIndex: currentIndex,
            question: currentQ.question, // Ditambahkan agar muncul di ResultPage
            selectedAnswer: option,
            correctAnswer: currentQ.correctAnswer, // Ditambahkan untuk validasi Backend
            isCorrect
        };
        historyRef.current = [...historyRef.current, answerRecord];

        // Feedback Instan
        if (isCorrect) toast.success("Benar! 🎉");
        else toast.error("Salah! ❌");

        // 🚀 Realtime Update ke Socket & DB
        if (roomCode) {
            const correctCount = historyRef.current.filter(h => h.isCorrect).length;
            const accuracy = Math.round((correctCount / historyRef.current.length) * 100);
            const progress = `${currentIndex + 1}/${questions.length}`;
            socket.emit("updateScore", { code: roomCode, score: newScore, accuracy, progress });
        }
        submitAnswer(realGameId, currentIndex, option, newScore).catch(() => { });

        // Jeda 1 detik biar siswa bisa lihat animasi benar/salah, lalu lanjut soal
        setTimeout(() => {
            setSelectedOption(null);
            if (currentIndex + 1 < questions.length) {
                if (onIntermission) onIntermission();
                setCurrentIndex(currentIndex + 1);
            } else {
                handleFinish(historyRef.current, newScore);
            }
        }, 1200);
    };

    const handleFinish = async (finalHistory: GameAnswer[], finalScore: number) => {
        if (isFinished) return;
        setIsFinished(true);
        if (timerRef.current) clearInterval(timerRef.current);

        // 🛠️ FIX: Map history berdasarkan daftar pertanyaan asli agar urut dan lengkap
        const completeHistory: GameAnswer[] = questions.map((q: any, index: number) => {
            const historyItem = finalHistory.find(h => h.questionIndex === index);
            if (historyItem) return historyItem;

            return {
                questionIndex: index,
                question: q.question,
                selectedAnswer: null,
                correctAnswer: q.correctAnswer,
                isCorrect: false
            };
        });

        const correctCount = completeHistory.filter((h: GameAnswer) => h.isCorrect).length;
        const realAccuracy = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

        /**
         * 🛠️ FRONTEND SYNC HACK (Penyesuaian terhadap game.service.ts baris 263)
         * Backend menghitung skor akhir berdasarkan rumus: (accuracy * 100) / 100.
         * Dengan mengirim 'finalScore' ke field 'accuracy', hasil kalkulasi ulang Backend 
         * akan tetap sama dengan angka di Leaderboard (misal: 300).
         */
        const payload = {
            scoreValue: finalScore,
            maxScore: questions.length * 100,
            accuracy: realAccuracy, // Dikirim skor agar kalkulasi backend menghasilkan angka yang identik
            timeSpent: totalTimeSpent,
            answersDetail: completeHistory,
        };

        // Simpan ke storage data asli untuk tampilan ResultPage UI
        sessionStorage.setItem("lastScore", finalScore.toString());
        sessionStorage.setItem("lastAccuracy", realAccuracy.toString());
        sessionStorage.setItem("lastBreakdown", JSON.stringify(completeHistory));

        if (onGameOver) {
            onGameOver(
                finalScore,
                realAccuracy,
                completeHistory
            );
            return;
        }

        try {
            await finishGame(
                realGameId,
                payload
            );
        } catch (e) {
            console.error(
                "Gagal simpan skor ke DB"
            );
        }

        navigate(
            "/student/result",
            {
                state: {
                    ...payload,
                    accuracy:
                        realAccuracy,
                },
            }
        );
    };

    // UI Fallbacks
    if (questions.length === 0) return <div className="p-10 text-center text-slate-400 font-bold animate-pulse">Menyiapkan arena... 🏟️</div>;
    if (isFinished) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-widest text-indigo-600">Menyimpan Skor... 🏆</div>;

    const currentQ = questions[currentIndex];

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

                    if (selectedOption) {
                        if (opt === currentQ.correctAnswer) {
                            btnStyle = "bg-emerald-500 border-emerald-600 scale-105 z-10 shadow-2xl shadow-emerald-500/50";
                        } else if (opt === selectedOption && opt !== currentQ.correctAnswer) {
                            btnStyle = "bg-rose-500 border-rose-600 opacity-80 scale-95";
                        } else {
                            btnStyle = "bg-slate-200 border-slate-300 text-slate-400 opacity-50 grayscale";
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