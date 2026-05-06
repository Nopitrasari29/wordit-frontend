import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { submitAnswer, finishGame } from "../../../pages/services/game.service";
import socket from "../../../hooks/useSocket";
import { toast } from "react-hot-toast";
import { Bot, Send, Loader2 } from "lucide-react";

export default function EssayEngine({ data, onGameOver, onIntermission }: { data: any, onGameOver?: any, onIntermission?: () => void }) {
    const navigate = useNavigate();
    const realGameId = data?.id || data?._id;
    const roomCode = data?.shareCode || "";

    useEffect(() => {
        console.log("🧠 ESSAY RAW DATA:", data);
    }, [data]);

    const gameConfig = useMemo(() => {
        if (Array.isArray(data?.gameJson)) return data.gameJson[0];
        if (data?.gameJson) return data.gameJson;
        if (data?.data?.questions) return data.data;
        if (data?.questions) return data;
        return null;
    }, [data]);

    const questions = useMemo(() => {
        return (
            gameConfig?.questions ||
            data?.questions ||
            data?.data?.questions ||
            []
        );
    }, [gameConfig, data]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(questions.length * 60);
    const [isFinished, setIsFinished] = useState(false);
    const [isGrading, setIsGrading] = useState(false);
    const [isSavingFinal, setIsSavingFinal] = useState(false);

    const [history, setHistory] = useState<any[]>([]);
    const [currentAnswer, setCurrentAnswer] = useState("");

    // ✅ FIX: Simpan feedback AI sementara untuk ditampilkan inline
    const [lastFeedback, setLastFeedback] = useState<{ points: number; isCorrect: boolean; justification?: string } | null>(null);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [totalTimeSpent, setTotalTimeSpent] = useState(0);
    // ✅ FIX: Ref untuk history agar bisa diakses dari handleTimeUp tanpa stale closure
    const historyRef = useRef<any[]>([]);
    const currentIndexRef = useRef(0);
    const scoreRef = useRef(0);
    const isFinishedRef = useRef(false);

    useEffect(() => { historyRef.current = history; }, [history]);
    useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
    useEffect(() => { scoreRef.current = score; }, [score]);

    useEffect(() => {
        if (questions.length === 0) return;
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    if (!isFinishedRef.current) handleTimeUp();
                    return 0;
                }
                return prev - 1;
            });
            setTotalTimeSpent(prev => prev + 1);
        }, 1000);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [questions]);

    const handleTimeUp = () => {
        if (isFinishedRef.current) return;
        toast.error("Waktu Habis! ⏰");

        // ✅ FIX: Isi semua soal yang belum dijawab dengan string kosong
        const currentHist = historyRef.current;
        const currentIdx = currentIndexRef.current;
        const currentScore = scoreRef.current;

        const completeHistory = [...currentHist];

        // Tambah soal saat ini yang sedang aktif (mungkin belum di-submit)
        if (completeHistory.length <= currentIdx) {
            completeHistory.push({
                questionIndex: currentIdx,
                question: questions[currentIdx]?.question || "",
                selectedAnswer: "", // ✅ string kosong, bukan null
                isCorrect: false,
                pointsEarned: 0
            });
        }

        // Tambah sisa soal yang belum sempat dijawab
        for (let i = completeHistory.length; i < questions.length; i++) {
            completeHistory.push({
                questionIndex: i,
                question: questions[i]?.question || "",
                selectedAnswer: "", // ✅ string kosong, bukan null
                isCorrect: false,
                pointsEarned: 0
            });
        }

        handleFinish(completeHistory, currentScore);
    };

    const handleAnswerSubmit = async (isTimeUp = false) => {
        if (isFinished || isGrading) return;
        setIsGrading(true);
        setLastFeedback(null);

        const currentQ = questions[currentIndex];
        const answerToSubmit = currentAnswer.trim();

        // ✅ Skor sementara: hitung lokal dulu (akan di-override oleh backend AI)
        // Ini hanya untuk UI real-time, bukan skor final
        const tempPoints = answerToSubmit.length > 10 ? 50 : answerToSubmit.length > 0 ? 25 : 0;
        const newScore = score + tempPoints;

        setScore(newScore);

        const answerRecord = {
            questionIndex: currentIndex,
            question: currentQ.question,
            selectedAnswer: answerToSubmit, // ✅ selalu string, tidak null
            isCorrect: false, // akan di-override backend
            pointsEarned: tempPoints // akan di-override backend
        };

        const newHistory = [...history, answerRecord];
        setHistory(newHistory);

        // Feedback sementara
        if (answerToSubmit.length > 10) {
            toast.success("Jawaban diterima! AI akan menilai saat selesai 🤖");
            setLastFeedback({ points: tempPoints, isCorrect: true });
        } else if (answerToSubmit.length > 0) {
            toast("Jawaban singkat diterima. Coba lebih detail! 💡");
            setLastFeedback({ points: tempPoints, isCorrect: false });
        } else if (!isTimeUp) {
            toast.error("Jawaban kosong tidak dapat dikirim.");
            setIsGrading(false);
            return;
        }

        if (roomCode) socket.emit("updateScore", { code: roomCode, score: newScore });
        submitAnswer(realGameId, currentIndex, answerToSubmit, newScore).catch(() => { });

        setTimeout(() => {
            setCurrentAnswer("");
            setLastFeedback(null);
            setIsGrading(false);

            if (currentIndex + 1 < questions.length && !isTimeUp) {
                if (onIntermission) onIntermission();
                setCurrentIndex(currentIndex + 1);
            } else {
                handleFinish(newHistory, newScore);
            }
        }, 1200);
    };

    const handleFinish = async (finalHistory: any[], finalScore: number) => {
        if (isFinishedRef.current) return;
        isFinishedRef.current = true;
        setIsFinished(true);
        setIsSavingFinal(true);
        if (timerRef.current) clearInterval(timerRef.current);

        // ✅ FIX: Pastikan semua soal terisi, tidak ada null
        let completeHistory = [...finalHistory];
        if (completeHistory.length < questions.length) {
            for (let i = completeHistory.length; i < questions.length; i++) {
                completeHistory.push({
                    questionIndex: i,
                    question: questions[i]?.question || "",
                    selectedAnswer: "", // ✅ string kosong
                    isCorrect: false,
                    pointsEarned: 0
                });
            }
        }

        const maxPossiblePoints = questions.length * 100;
        const tempAccuracy = 0; // backend akan hitung ulang

        const payload = {
            scoreValue: finalScore,
            maxScore: maxPossiblePoints,
            accuracy: tempAccuracy,
            timeSpent: totalTimeSpent,
            answersDetail: completeHistory,
        };

        // Simpan fallback
        sessionStorage.setItem("lastScore", finalScore.toString());
        sessionStorage.setItem("lastAccuracy", tempAccuracy.toString());
        sessionStorage.setItem("lastBreakdown", JSON.stringify(completeHistory));

        try {
            const res = await finishGame(realGameId, payload);
            const result = res?.data?.result;

            if (result) {
                console.log("🔥 BACKEND AI RESULT:", result);
                sessionStorage.setItem("lastScore", result.scoreValue.toString());
                sessionStorage.setItem("lastAccuracy", result.accuracy.toString());
                sessionStorage.setItem("lastBreakdown", JSON.stringify(result.answersDetail));

                if (onGameOver) {
                    onGameOver(result.scoreValue, result.accuracy, result.answersDetail);
                    return;
                }

                navigate("/student/result", { state: result });
                return;
            }
        } catch (e) {
            console.error("❌ FinishGame Error:", e);
            toast.error("Gagal menyimpan skor. Menggunakan data lokal.");
        }

        setIsSavingFinal(false);
        if (onGameOver) onGameOver(finalScore, tempAccuracy, completeHistory);
        else navigate("/student/result", { state: payload });
    };

    if (questions.length === 0) {
        return (
            <div className="p-10 text-center animate-pulse">
                Menyiapkan AI... 🤖
            </div>
        );
    }

    if (isFinished) {
        return (
            <div className="min-h-[300px] flex flex-col items-center justify-center gap-4 p-20 text-center animate-fade-in">
                <Loader2 className="animate-spin text-indigo-600" size={40} />
                <p className="font-black text-indigo-600 text-xl animate-pulse">
                    {isSavingFinal ? "AI sedang menilai jawabanmu... 🤖✨" : "Menyimpan Skor... 🏆"}
                </p>
                <p className="text-slate-400 text-sm font-bold">Mohon tunggu, jangan tutup halaman ini</p>
            </div>
        );
    }

    const currentQ = questions[currentIndex];

    return (
        <div className="flex flex-col items-center p-4 md:p-6 space-y-6 max-w-4xl mx-auto w-full font-sans">

            {/* HEADER */}
            <div className="w-full flex justify-between bg-white p-4 md:p-6 rounded-[2rem] shadow-sm border-2 border-indigo-50 items-center">
                <div className="flex flex-col font-black text-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">Soal</span>
                    <span className="text-xl text-indigo-600">
                        {currentIndex + 1}
                        <span className="text-sm text-slate-300"> / {questions.length}</span>
                    </span>
                </div>

                <div className="flex flex-col items-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">Sisa Waktu</span>
                    <span className={`text-2xl font-black ${timeLeft <= 20 ? 'text-rose-500 animate-pulse' : 'text-slate-700'}`}>
                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </span>
                </div>

                <div className="text-center flex flex-col font-black">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">Sementara</span>
                    <span className="text-indigo-600 text-2xl">{score}</span>
                </div>
            </div>

            {/* CONTENT */}
            <div className="w-full bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col gap-6">

                {/* ✅ Sprint 3 AI-06: Banner info bahwa skor akan dinilai AI di akhir */}
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-5 py-3 flex items-center gap-3">
                    <Bot size={18} className="text-indigo-500 shrink-0" />
                    <p className="text-xs font-bold text-indigo-600">
                        Jawaban akan dinilai otomatis oleh AI setelah semua soal selesai. Skor sementara di atas belum final.
                    </p>
                </div>

                <h2 className="text-xl md:text-3xl font-black text-slate-800 leading-tight">
                    {currentQ.question}
                </h2>

                {/* Hint jika tersedia */}
                {currentQ.hint && (
                    <p className="text-sm font-bold text-slate-400 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                        💡 {currentQ.hint}
                    </p>
                )}

                <div className="relative mt-2">
                    <textarea
                        value={currentAnswer}
                        onChange={(e) => setCurrentAnswer(e.target.value)}
                        disabled={isGrading}
                        placeholder="Ketik jawaban penjelasanmu di sini..."
                        className="w-full h-48 bg-slate-50 border-2 border-slate-200 rounded-[2rem] p-6 focus:bg-white focus:border-indigo-500 outline-none resize-none font-bold text-slate-700 transition-all disabled:opacity-50 text-lg"
                    />
                    <div className="absolute bottom-6 right-6 text-xs font-black text-slate-400">
                        {currentAnswer.length} karakter
                    </div>
                </div>

                {/* Feedback sementara inline */}
                {lastFeedback && (
                    <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl text-sm font-bold animate-fade-in ${lastFeedback.isCorrect ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                        <Bot size={16} />
                        {lastFeedback.isCorrect ? "Jawaban diterima! Penilaian AI menunggu di akhir." : "Jawaban diterima. Coba lebih detail untuk skor lebih tinggi!"}
                    </div>
                )}

                <div className="flex justify-between items-center mt-2">
                    {/* ✅ Tombol skip (lewati) untuk soal yang tidak bisa dijawab */}
                    <button
                        onClick={() => {
                            if (isGrading) return;
                            const currentQ = questions[currentIndex];
                            const skipRecord = {
                                questionIndex: currentIndex,
                                question: currentQ.question,
                                selectedAnswer: "",
                                isCorrect: false,
                                pointsEarned: 0
                            };
                            const newHistory = [...history, skipRecord];
                            setHistory(newHistory);
                            setCurrentAnswer("");

                            if (currentIndex + 1 < questions.length) {
                                if (onIntermission) onIntermission();
                                setCurrentIndex(currentIndex + 1);
                            } else {
                                handleFinish(newHistory, score);
                            }
                        }}
                        disabled={isGrading}
                        className="text-slate-400 hover:text-slate-600 font-black text-sm px-4 py-2 rounded-full hover:bg-slate-100 transition-all"
                    >
                        Lewati →
                    </button>

                    <button
                        onClick={() => handleAnswerSubmit(false)}
                        disabled={isGrading || currentAnswer.trim().length === 0}
                        className={`flex items-center gap-3 px-8 py-4 rounded-full font-black text-lg transition-all active:scale-95 shadow-lg ${isGrading
                            ? 'bg-indigo-300 text-white cursor-not-allowed'
                            : 'bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-indigo-500/50 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none'
                            }`}
                    >
                        {isGrading ? (
                            <>
                                <Loader2 size={20} className="animate-spin" /> Menyimpan...
                            </>
                        ) : (
                            <>
                                Submit Jawaban <Send size={20} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
