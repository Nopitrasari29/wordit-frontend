import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { submitAnswer, finishGame } from "../../../pages/services/game.service";
import socket from "../../../hooks/useSocket";
import { toast } from "react-hot-toast";
import { Bot, Send } from "lucide-react";

export default function EssayEngine({ data, onGameOver, onIntermission }: { data: any, onGameOver?: any, onIntermission?: () => void }) {
    const navigate = useNavigate();
    const realGameId = data?.id || data?._id;
    const roomCode = data?.shareCode || "";

    const gameConfig = useMemo(() => Array.isArray(data?.gameJson) ? data.gameJson[0] : data?.gameJson, [data]);
    const questions = useMemo(() => gameConfig?.questions || [], [gameConfig]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(questions.length * 60); // 60 dtk per essay
    const [isFinished, setIsFinished] = useState(false);
    const [isGrading, setIsGrading] = useState(false); // State loading saat AI menilai

    const [history, setHistory] = useState<any[]>([]);
    const [currentAnswer, setCurrentAnswer] = useState("");

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [totalTimeSpent, setTotalTimeSpent] = useState(0);

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
        // Force submit jawaban yang ada
        handleAnswerSubmit(true);
    };

    // 🤖 LOKAL AI GRADING MOCK (Bisa diganti panggil API Groq nantinya)
    const gradeAnswerWithAI = (answer: string, keywords: string[]): { points: number, isCorrect: boolean } => {
        if (!answer.trim()) return { points: 0, isCorrect: false };

        const answerLower = answer.toLowerCase();
        let matchedCount = 0;

        keywords.forEach(kw => {
            if (answerLower.includes(kw.toLowerCase())) matchedCount++;
        });

        const accuracy = keywords.length > 0 ? matchedCount / keywords.length : 0;
        let points = 0;

        if (accuracy > 0.7) points = 100;
        else if (accuracy > 0.3) points = 50;
        else if (accuracy > 0) points = 25;

        return { points, isCorrect: points > 50 };
    };

    const handleAnswerSubmit = async (isTimeUp = false) => {
        if (isFinished || isGrading) return;
        setIsGrading(true);

        const currentQ = questions[currentIndex];

        // 🤖 Proses Penilaian
        const { points, isCorrect } = gradeAnswerWithAI(currentAnswer, currentQ.keywords);
        const newScore = score + points;

        setScore(newScore);

        const answerRecord = {
            questionIndex: currentIndex,
            question: currentQ.question,
            selectedAnswer: currentAnswer,
            isCorrect,
            pointsEarned: points
        };
        const newHistory = [...history, answerRecord];
        setHistory(newHistory);

        if (points === 100) toast.success("Jawaban Sempurna! AI sangat menyukainya 🤖✨");
        else if (points >= 50) toast.success("Jawaban Cukup Baik! 👍");
        else if (!isTimeUp) toast.error("Kurang tepat, tapi tetap semangat! 💪");

        if (roomCode) socket.emit("updateScore", { code: roomCode, score: newScore });
        submitAnswer(realGameId, currentIndex, currentAnswer, newScore).catch(() => { });

        setTimeout(() => {
            setCurrentAnswer("");
            setIsGrading(false);
            if (currentIndex + 1 < questions.length && !isTimeUp) {
                if (onIntermission) onIntermission();
                setCurrentIndex(currentIndex + 1);
            } else {
                handleFinish(newHistory, newScore);
            }
        }, 1500);
    };

    const handleFinish = async (finalHistory: any[], finalScore: number) => {
        setIsFinished(true);
        if (timerRef.current) clearInterval(timerRef.current);

        let completeHistory = [...finalHistory];
        if (completeHistory.length < questions.length) {
            for (let i = completeHistory.length; i < questions.length; i++) {
                completeHistory.push({ questionIndex: i, selectedAnswer: null, isCorrect: false, pointsEarned: 0 });
            }
        }

        const totalPointsEarned = completeHistory.reduce((acc, curr) => acc + (curr.pointsEarned || 0), 0);
        const maxPossiblePoints = questions.length * 100;
        const accuracy = Math.round((totalPointsEarned / maxPossiblePoints) * 100);

        const payload = {
            scoreValue: finalScore,
            maxScore: maxPossiblePoints,
            accuracy,
            timeSpent: totalTimeSpent,
            answersDetail: completeHistory,
        };

        sessionStorage.setItem("lastScore", finalScore.toString());
        sessionStorage.setItem("lastAccuracy", accuracy.toString());
        sessionStorage.setItem("lastBreakdown", JSON.stringify(payload.answersDetail));

        try { await finishGame(realGameId, payload); } catch (e) { }

        if (onGameOver) onGameOver(finalScore, accuracy, payload.answersDetail);
        else navigate("/student/result", { state: payload });
    };

    if (questions.length === 0) return <div className="p-10 text-center animate-pulse">Menyiapkan AI... 🤖</div>;
    if (isFinished) return <div className="p-20 text-center font-black animate-pulse text-indigo-600">Menyimpan Skor... 🏆</div>;

    const currentQ = questions[currentIndex];

    return (
        <div className="flex flex-col items-center p-4 md:p-6 space-y-6 max-w-4xl mx-auto w-full font-sans">
            <div className="w-full flex justify-between bg-white p-4 md:p-6 rounded-[2rem] shadow-sm border-2 border-indigo-50 items-center">
                <div className="flex flex-col font-black text-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">Soal</span>
                    <span className="text-xl text-indigo-600">{currentIndex + 1} <span className="text-sm text-slate-300">/ {questions.length}</span></span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">Sisa Waktu</span>
                    <span className={`text-2xl font-black ${timeLeft <= 20 ? 'text-rose-500 animate-pulse' : 'text-slate-700'}`}>
                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </span>
                </div>
                <div className="text-center flex flex-col font-black">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">Skor</span>
                    <span className="text-indigo-600 text-2xl">{score}</span>
                </div>
            </div>

            <div className="w-full bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col gap-6">
                <h2 className="text-xl md:text-3xl font-black text-slate-800 leading-tight">
                    {currentQ.question}
                </h2>

                <div className="relative mt-4">
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

                <div className="flex justify-end mt-2">
                    <button
                        onClick={() => handleAnswerSubmit(false)}
                        disabled={isGrading || currentAnswer.trim().length === 0}
                        className={`flex items-center gap-3 px-8 py-4 rounded-full font-black text-lg transition-all active:scale-95 shadow-lg ${isGrading ? 'bg-indigo-300 text-white cursor-not-allowed' :
                                'bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-indigo-500/50'
                            }`}
                    >
                        {isGrading ? (
                            <><Bot className="animate-bounce" /> AI Menilai...</>
                        ) : (
                            <>Submit Jawaban <Send size={20} /></>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}