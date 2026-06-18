import { useState, useEffect, useCallback, useRef } from "react";
import { submitAnswer, finishGame } from "../../../pages/services/game.service";
import socket from "../../../hooks/useSocket";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function MazeChaseEngine({ data, onGameOver, onIntermission }: { data: any, onGameOver?: any, onIntermission?: any }) {
    const navigate = useNavigate();
    const gameConfig = Array.isArray(data?.gameJson) ? data.gameJson[0] : data?.gameJson;
    const questions = gameConfig?.questions || [];
    const realGameId = data?.id || data?._id;
    const roomCode = data?.shareCode || "";

    const [currentIdx, setCurrentIdx] = useState(0);
    const [playerPos, setPlayerPos] = useState({ r: 2, c: 2 });
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [grid, setGrid] = useState<any[][]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [timeLeft, setTimeLeft] = useState(gameConfig?.timeLimit ? Number(gameConfig.timeLimit) : 15);

    const isBusy = useRef(false);
    const isSavingRef = useRef(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const transitionRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const startTimeRef = useRef<number>(Date.now());
    const currentQ = questions[currentIdx];

    // Cleanup timer & transition on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (transitionRef.current) clearTimeout(transitionRef.current);
        };
    }, []);

    const initLevel = useCallback(() => {
        if (!currentQ) return;
        let newGrid = Array(5).fill(null).map(() => Array(5).fill(null));
        const allAnswers = questions.map((q: any) => q.answer);
        const distractors = allAnswers
            .filter((ans: string) => ans !== currentQ.answer)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);

        while (distractors.length < 3) distractors.push("Opsi " + (distractors.length + 1));

        const targets = [
            { text: currentQ.answer, isCorrect: true },
            ...distractors.map((text: string) => ({ text, isCorrect: false }))
        ].sort(() => Math.random() - 0.5);

        const edgePositions = [[0, 0], [0, 4], [4, 0], [4, 4]];
        edgePositions.forEach((pos, i) => {
            newGrid[pos[0]][pos[1]] = targets[i];
        });

        // 🧱 Tambahkan dinding rintangan (obstacles)
        const obstacles = [[1, 2], [3, 2]];
        obstacles.forEach(([r, c]) => {
            newGrid[r][c] = { isObstacle: true };
        });

        setGrid(newGrid);
        setPlayerPos({ r: 2, c: 2 });
        setTimeLeft(data?.gameJson?.timeLimit ? Number(data.gameJson.timeLimit) : 15);
        isBusy.current = false;
    }, [currentQ, questions, data]);

    useEffect(() => { initLevel(); }, [initLevel]);

    const handleAction = useCallback(async (type: "PORTAL" | "TIMEOUT", cell: any) => {
        if (isBusy.current) return;
        isBusy.current = true;

        if (timerRef.current) clearInterval(timerRef.current);

        let isCorrect = (type === "PORTAL" && cell) ? cell.isCorrect : false;

        let newScore = isCorrect ? score + 100 : score;
        let newLives = isCorrect ? lives : lives - 1;

        if (isCorrect) {
            setScore(newScore);
            toast.success("Tepat Sekali! 🌟");

            const currentAccuracy = Math.round((newScore / ((currentIdx + 1) * 100)) * 100);

            socket.emit("updateScore", {
                code: roomCode,
                score: newScore,
                accuracy: currentAccuracy,
                progress: `${currentIdx + 1}/${questions.length}`,
            });
            submitAnswer(realGameId, currentIdx, cell.text, newScore).catch(() => { });
        } else {
            setLives(newLives);
            toast.error(type === "TIMEOUT" ? "Waktu Habis! ⏰" : "Portal Salah! 🐙");
            submitAnswer(realGameId, currentIdx, type === "TIMEOUT" ? "TIMEOUT" : cell?.text, newScore).catch(() => { });
        }

        const currentHistoryItem = { 
            word: cell?.text || "TIMEOUT", 
            isCorrect, 
            time: (gameConfig?.timeLimit ? Number(gameConfig.timeLimit) : 15) - timeLeft 
        };
        const updatedHistory = [...history, currentHistoryItem];
        setHistory(updatedHistory);

        transitionRef.current = setTimeout(() => {
            const isGameOver = newLives <= 0 || currentIdx + 1 >= questions.length;
            if (isGameOver) {
                if (isSavingRef.current) return;
                isSavingRef.current = true;
                const accuracy = Math.round((newScore / (questions.length * 100)) * 100);
                const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
                const payload = {
                    scoreValue: newScore,
                    maxScore: questions.length * 100,
                    accuracy,
                    timeSpent,
                    answersDetail: updatedHistory
                };

                sessionStorage.setItem("lastScore", newScore.toString());
                sessionStorage.setItem("lastAccuracy", accuracy.toString());
                sessionStorage.setItem("lastBreakdown", JSON.stringify(updatedHistory));

                if (onGameOver) {
                    onGameOver(newScore, accuracy, updatedHistory);
                    return;
                }

                finishGame(realGameId, payload).catch(() => { });
                navigate("/student/result", { state: payload });
            } else {
                if (onIntermission) onIntermission();
                setCurrentIdx(prev => prev + 1);
            }
        }, 800);
    }, [score, lives, history, currentIdx, questions.length, realGameId, navigate, onGameOver, onIntermission, timeLeft, roomCode, gameConfig]);

    useEffect(() => { initLevel(); }, [initLevel]);

    useEffect(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    handleAction("TIMEOUT", null);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [currentIdx, handleAction]);

    const movePlayer = useCallback((dr: number, dc: number) => {
        if (isBusy.current || lives <= 0) return;
        setPlayerPos(prev => {
            const nr = Math.max(0, Math.min(4, prev.r + dr));
            const nc = Math.max(0, Math.min(4, prev.c + dc));
            if (nr === prev.r && nc === prev.c) return prev;
            const cell = grid[nr][nc];
            if (cell?.isObstacle) return prev;
            if (cell) { handleAction("PORTAL", cell); return prev; }
            return { r: nr, c: nc };
        });
    }, [grid, lives, handleAction]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
                e.preventDefault();
                if (e.key === "ArrowUp") movePlayer(-1, 0);
                if (e.key === "ArrowDown") movePlayer(1, 0);
                if (e.key === "ArrowLeft") movePlayer(0, -1);
                if (e.key === "ArrowRight") movePlayer(0, 1);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [movePlayer]);

    if (!currentQ) return null;

    return (
        <div className="flex flex-col items-center p-6 space-y-6 max-w-2xl mx-auto font-sans select-none w-full">
            {/* Play Instructions */}
            <div className="w-full bg-indigo-50/75 backdrop-blur-md border border-indigo-100 rounded-2xl p-4 text-center">
                <p className="text-xs font-bold text-indigo-950 flex flex-col items-center gap-1">
                    <span>🎮 <strong>Cara Bermain:</strong></span>
                    <span>Arahkan karakter 🏃 menggunakan tombol panah keyboard ⬆️⬇️⬅️➡️ atau D-pad virtual di bawah menuju kotak jawaban yang benar! Hindari dinding pembatas 🧱.</span>
                </p>
            </div>

            {/* HUD HEADER */}
            <div className="w-full flex justify-between bg-slate-900/95 backdrop-blur-md p-5 rounded-[2rem] border border-slate-800 text-white items-center shadow-lg">
                <div className="flex flex-col text-center items-center">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Nyawa</span>
                    <div className="flex gap-0.5">
                        {[...Array(3)].map((_, i) => (
                            <span key={i} className={`text-sm transition-all duration-300 ${i < lives ? 'scale-100' : 'grayscale opacity-20 scale-75'}`}>❤️</span>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center mb-0.5">Sisa Waktu</span>
                    <span className={`text-xl font-black px-4 py-0.5 rounded-full border ${timeLeft <= 5 ? 'text-rose-500 border-rose-500/20 bg-rose-500/10 animate-pulse' : 'text-indigo-300 border-indigo-500/10 bg-indigo-500/5'}`}>{timeLeft}s</span>
                </div>
                <div className="text-right">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Skor</span>
                    <p className="font-black text-indigo-400 text-xl">{score}</p>
                </div>
            </div>

            {/* QUESTION PANEL */}
            <div className="bg-white p-6 rounded-[2rem] shadow-md border-2 border-indigo-50 w-full text-center relative overflow-hidden">
                <div className="absolute bottom-0 left-0 h-1 bg-indigo-500 transition-all duration-1000" style={{ width: `${(timeLeft / (gameConfig?.timeLimit ? Number(gameConfig.timeLimit) : 15)) * 100}%` }} />
                <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest block mb-1">Pertanyaan</span>
                <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight leading-snug">"{currentQ.question}"</h2>
            </div>

            {/* GRID ARCADE ARENA */}
            <div className="bg-slate-950 p-4 rounded-[2.5rem] shadow-2xl border-[10px] border-slate-900 w-full max-w-[420px] mx-auto shadow-indigo-500/5">
                <div className="grid grid-cols-5 gap-2">
                    {grid.map((row, r) => row.map((cell, c) => (
                        <div key={`${r}-${c}`} className={`aspect-square w-full rounded-2xl flex items-center justify-center transition-all duration-200 relative ${playerPos.r === r && playerPos.c === c ? 'bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.6)] scale-105 z-10' : 'bg-slate-900/40'}`}>
                            {playerPos.r === r && playerPos.c === c ? (
                                <span className="text-2xl sm:text-3xl animate-bounce">🏃</span>
                            ) : cell?.isObstacle ? (
                                <div className="w-[90%] h-[90%] bg-rose-950/70 border-2 border-rose-500/30 rounded-xl flex items-center justify-center text-lg shadow-[inset_0_0_10px_rgba(244,63,94,0.3)] select-none">🧱</div>
                            ) : cell ? (
                                <div className="bg-amber-400/90 border border-amber-300 p-1 rounded-xl text-center leading-tight shadow-md shadow-amber-500/10 w-[94%] h-[94%] flex items-center justify-center overflow-hidden [transform:translateZ(0)]">
                                    <span className="font-black text-[7px] sm:text-[9px] uppercase break-words px-0.5 line-clamp-3 text-amber-950 leading-tight">{cell.text}</span>
                                </div>
                            ) : null}
                        </div>
                    )))}
                </div>
            </div>

            {/* VIRTUAL D-PAD CONTROLLER */}
            <div className="flex flex-col items-center gap-1.5 mt-2 bg-slate-900/40 p-4 rounded-3xl border border-slate-800/40 shadow-inner">
                <button
                    onClick={() => movePlayer(-1, 0)}
                    disabled={isBusy.current || lives <= 0}
                    className="w-12 h-12 bg-indigo-600 hover:bg-indigo-500 active:scale-90 disabled:bg-slate-800 disabled:text-slate-600 disabled:border-slate-850 text-white rounded-xl font-black text-xl shadow-md flex items-center justify-center transition-all border border-indigo-500/20"
                >
                    ⬆️
                </button>
                <div className="flex gap-12">
                    <button
                        onClick={() => movePlayer(0, -1)}
                        disabled={isBusy.current || lives <= 0}
                        className="w-12 h-12 bg-indigo-600 hover:bg-indigo-500 active:scale-90 disabled:bg-slate-800 disabled:text-slate-600 disabled:border-slate-850 text-white rounded-xl font-black text-xl shadow-md flex items-center justify-center transition-all border border-indigo-500/20"
                    >
                        ⬅️
                    </button>
                    <button
                        onClick={() => movePlayer(0, 1)}
                        disabled={isBusy.current || lives <= 0}
                        className="w-12 h-12 bg-indigo-600 hover:bg-indigo-500 active:scale-90 disabled:bg-slate-800 disabled:text-slate-600 disabled:border-slate-850 text-white rounded-xl font-black text-xl shadow-md flex items-center justify-center transition-all border border-indigo-500/20"
                    >
                        ➡️
                    </button>
                </div>
                <button
                    onClick={() => movePlayer(1, 0)}
                    disabled={isBusy.current || lives <= 0}
                    className="w-12 h-12 bg-indigo-600 hover:bg-indigo-500 active:scale-90 disabled:bg-slate-800 disabled:text-slate-600 disabled:border-slate-850 text-white rounded-xl font-black text-xl shadow-md flex items-center justify-center transition-all border border-indigo-500/20"
                >
                    ⬇️
                </button>
            </div>
        </div>
    );
}