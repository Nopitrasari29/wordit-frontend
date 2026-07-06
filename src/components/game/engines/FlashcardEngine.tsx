import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../../../hooks/useSocket";
import { submitAnswer, finishGame } from "../../../pages/services/game.service";

export default function FlashcardEngine({ data, onGameOver }: { data: any, onGameOver?: any, onIntermission?: () => void }) {
    const navigate = useNavigate();
    const realGameId = data?.id || data?._id;

    const gameConfig = Array.isArray(data?.gameJson) ? data.gameJson[0] : data?.gameJson;
    const cards = gameConfig?.cards || [];
    const [index, setIndex] = useState(0);
    const [show, setShow] = useState(false);
    const [score, setScore] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [breakdown, setBreakdown] = useState<any[]>([]);
    const [timeSpent, setTimeSpent] = useState(0);

    const [timeLeft, setTimeLeft] = useState(() => {
        const gameLimit = gameConfig?.timeLimit ? Number(gameConfig.timeLimit) : 0;
        return gameLimit > 0 ? gameLimit : cards.length * 10;
    });
    const questionStartTimeRef = useRef(gameConfig?.timeLimit ? Number(gameConfig.timeLimit) : cards.length * 10);
    const isBusy = useRef(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const transitionRef = useRef<any>(null);
    const isFinishing = useRef(false);

    const card = cards[index];

    // 1. Timer Global
    useEffect(() => {
        const globalTimer = setInterval(() => setTimeSpent(prev => prev + 1), 1000);
        return () => clearInterval(globalTimer);
    }, []);

    // 2. 🎯 FUNGSI PENYELESAIAN
    const handleFinish = useCallback(async (finalScore: number, finalBreakdown: any[], finalCorrect: number) => {
        if (isFinishing.current) return;
        isFinishing.current = true;

        const accuracy = cards.length > 0 ? Math.round((finalCorrect / cards.length) * 100) : 0;
        const maxScoreConfig = gameConfig?.maxScore ? Number(gameConfig.maxScore) : 0;

        const payload = {
            scoreValue: finalScore,
            maxScore: maxScoreConfig || cards.length * 100,
            accuracy,
            timeSpent,
            answersDetail: finalBreakdown,
        };

        sessionStorage.setItem("lastScore", finalScore.toString());
        sessionStorage.setItem("lastAccuracy", accuracy.toString());
        sessionStorage.setItem("lastBreakdown", JSON.stringify(finalBreakdown));

        if (onGameOver) {
            onGameOver(finalScore, accuracy, finalBreakdown);
            return;
        }

        try {
            await finishGame(realGameId, payload);
        } catch (e) {
            console.error(e);
        }
        navigate("/student/result", { state: payload });
    }, [realGameId, cards.length, gameConfig, onGameOver, navigate, timeSpent]);

    // 🎯 FUNGSI EVALUASI
    const handleEvaluation = useCallback(async (isCorrect: boolean, isTimeout = false) => {
        if (isBusy.current) return;
        isBusy.current = true;

        if (timerRef.current) clearInterval(timerRef.current);

        setShow(false);
        // Hitung poin proporsional dari maxScore config
        const maxScoreConfig = gameConfig?.maxScore ? Number(gameConfig.maxScore) : 0;
        const totalCards = cards.length;
        const pointsPerCard = maxScoreConfig && totalCards > 0 ? Math.floor(maxScoreConfig / totalCards) : 100;
        const points = isCorrect ? pointsPerCard : 0;
        const newScore = score + points;
        const newCorrectCount = isCorrect ? correctCount + 1 : correctCount;

        setScore(newScore);
        setCorrectCount(newCorrectCount);

        const currentAnswer = {
            questionIndex: index,
            word: cards[index]?.front || "Kartu",
            selectedAnswer: isCorrect ? "HAFAL" : (isTimeout ? null : "LUPA"),
            question: cards[index]?.front || `Kartu ${index + 1}`,
            userAnswer: isTimeout ? "Waktu Habis" : (isCorrect ? "Hafal" : "Lupa"),
            isCorrect: isCorrect,
            time: Math.max(0, questionStartTimeRef.current - timeLeft),
            pointsEarned: points
        };
        const newBreakdown = [...breakdown, currentAnswer];
        setBreakdown(newBreakdown);

        if (data.shareCode) {
            const currentAccuracy = Math.round((newCorrectCount / (index + 1)) * 100);

            socket.emit("updateScore", {
                code: data.shareCode,
                score: newScore,
                accuracy: currentAccuracy,
                progress: `${index + 1}/${cards.length}`,
            });
        }
        submitAnswer(realGameId, index, isCorrect ? "HAFAL" : "LUPA", points).catch(() => { });

        transitionRef.current = setTimeout(() => {
            if (index < cards.length - 1) {
                setIndex(prev => prev + 1);
                questionStartTimeRef.current = timeLeft;
                isBusy.current = false;
            } else {
                handleFinish(newScore, newBreakdown, newCorrectCount);
            }
        }, 800);
    }, [index, score, correctCount, breakdown, cards, realGameId, data.shareCode, gameConfig, timeLeft, handleFinish]);

    // 3. 🎯 TIMER HITUNG MUNDUR GLOBAL
    useEffect(() => {
        if (isFinishing.current) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleFinish(score, breakdown, correctCount);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [score, breakdown, correctCount, handleFinish]);


    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (transitionRef.current) clearTimeout(transitionRef.current);
            try {
                if ("speechSynthesis" in window) {
                    window.speechSynthesis.cancel();
                }
            } catch {}
        };
    }, []);

    if (!cards || cards.length === 0) {
        return (
            <div className="flex items-center justify-center h-full w-full">
                <div className="text-center">
                    <h2 className="text-2xl font-black text-slate-400">Tidak ada Flashcard</h2>
                    <p className="text-slate-300 text-sm mt-2">Data kartu belum tersedia.</p>
                </div>
            </div>
        );
    }

    if (!card) return null;

    return (
        <div className="flex flex-col items-center justify-center p-6 space-y-6 max-w-2xl mx-auto font-sans w-full select-none">
            {/* Play Instructions */}
            <div className="w-full bg-indigo-50/75 backdrop-blur-md border border-indigo-100 rounded-2xl p-4 text-center">
                <p className="text-xs font-bold text-indigo-950">
                    🃏 <span>Hafalkan isi kartu! Klik kartu untuk membalik & membuka jawabannya, kemudian evaluasi ingatanmu.</span>
                </p>
            </div>

            {/* HUD */}
            <div className="w-full flex justify-between bg-slate-900/95 backdrop-blur-md p-5 rounded-[2rem] border border-slate-800 text-white items-center">
                <div className="flex flex-col font-black">
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest mb-0.5">Kartu</span>
                    <span className="text-indigo-400 italic text-lg">{index + 1} / {cards.length}</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center mb-0.5">Sisa Waktu</span>
                    <span className={`text-xl font-black px-4 py-0.5 rounded-full border ${timeLeft <= 5 ? 'text-rose-500 border-rose-500/20 bg-rose-500/10 animate-pulse' : 'text-indigo-300 border-indigo-500/10 bg-indigo-500/5'}`}>
                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </span>
                </div>
                <div className="text-right flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Skor</span>
                    <span className="text-indigo-400 font-black text-xl">{score}</span>
                </div>
            </div>

            {/* 3D FLASHCARD CONTAINER */}
            <div className="w-full aspect-[4/3] max-w-lg [perspective:1000px]">
                <div
                    onClick={() => !isBusy.current && setShow(!show)}
                    className={`w-full h-full relative rounded-[2.5rem] shadow-2xl transition-transform duration-700 [transform-style:preserve-3d] cursor-pointer ${show ? '[transform:rotateY(180deg)]' : ''}`}
                >
                    {/* FRONT SIDE (Question) */}
                    <div className="absolute inset-0 w-full h-full bg-white rounded-[2.5rem] border-[8px] border-indigo-50/50 p-8 flex flex-col justify-between items-center [backface-visibility:hidden]">
                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">Pertanyaan</span>
                        
                        <div className="flex-1 flex items-center justify-center">
                            <h3 className="text-3xl md:text-4xl font-black leading-tight uppercase italic text-slate-800 text-center tracking-tight px-4">{card.front}</h3>
                        </div>

                        {/* Audio TTS button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                try {
                                    if ('speechSynthesis' in window) {
                                        window.speechSynthesis.cancel();
                                        const utterance = new SpeechSynthesisUtterance(card.front);
                                        utterance.lang = "id-ID";
                                        window.speechSynthesis.speak(utterance);
                                    }
                                } catch (err) {
                                    console.error(err);
                                }
                            }}
                            className="w-12 h-12 rounded-full bg-indigo-50 hover:bg-indigo-100/70 border border-indigo-100 flex items-center justify-center text-lg active:scale-90 transition-all text-indigo-600 shadow-sm"
                            title="Dengarkan Pelafalan"
                        >
                            🔊
                        </button>
                    </div>

                    {/* BACK SIDE (Answer) */}
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-indigo-600 to-violet-800 rounded-[2.5rem] border-[8px] border-indigo-500/20 p-8 flex flex-col justify-between items-center [backface-visibility:hidden] [transform:rotateY(180deg)] text-white shadow-[0_10px_35px_rgba(99,102,241,0.25)]">
                        <span className="text-[9px] font-black text-indigo-200 uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-white/10">Jawaban</span>
                        
                        <div className="flex-1 flex items-center justify-center">
                            <h3 className="text-3xl md:text-4xl font-black leading-tight uppercase italic text-center tracking-tight px-4 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">{card.back}</h3>
                        </div>

                        {/* Audio TTS button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                try {
                                    if ('speechSynthesis' in window) {
                                        window.speechSynthesis.cancel();
                                        const utterance = new SpeechSynthesisUtterance(card.back);
                                        utterance.lang = "id-ID";
                                        window.speechSynthesis.speak(utterance);
                                    }
                                } catch (err) {
                                    console.error(err);
                                }
                            }}
                            className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-lg active:scale-90 transition-all text-white shadow-sm"
                            title="Dengarkan Pelafalan"
                        >
                            🔊
                        </button>
                    </div>
                </div>
            </div>

            {/* ACTION CONTROLS */}
            <div className="w-full h-20 flex items-center justify-center max-w-lg">
                {!show ? (
                    <button
                        onClick={() => setShow(true)}
                        disabled={isBusy.current}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white py-5 rounded-[2rem] font-black text-lg shadow-xl active:scale-95 transition-all uppercase italic tracking-widest border border-slate-700"
                    >
                        Buka Jawaban 🔄
                    </button>
                ) : (
                    <div className="flex gap-4 w-full animate-in zoom-in duration-200">
                        <button
                            onClick={() => handleEvaluation(false)}
                            className="flex-1 bg-rose-500 hover:bg-rose-400 text-white py-5 rounded-[2rem] font-black text-lg shadow-lg shadow-rose-500/10 active:scale-95 transition-all uppercase italic tracking-widest border border-rose-600/35"
                        >
                            Lupa ❌
                        </button>
                        <button
                            onClick={() => handleEvaluation(true)}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white py-5 rounded-[2rem] font-black text-lg shadow-lg shadow-emerald-500/10 active:scale-95 transition-all uppercase italic tracking-widest border border-emerald-600/35"
                        >
                            Hafal ✅
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}