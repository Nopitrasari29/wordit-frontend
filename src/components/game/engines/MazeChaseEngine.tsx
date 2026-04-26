import { useState, useEffect, useCallback, useRef } from "react";
import { submitAnswer, finishGame } from "../../../pages/services/game.service";
import socket from "../../../hooks/useSocket"; // 🎯 Tambahkan socket untuk sinkronisasi Teacher
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function MazeChaseEngine({ data, onGameOver, onIntermission }: { data: any, onGameOver?: any, onIntermission?: any }) {
    const navigate = useNavigate();
    const questions = data?.gameJson?.questions || [];
    const realGameId = data?.id || data?._id;
    const roomCode = data?.shareCode || ""; // 🎯 Ambil room code untuk socket

    const [currentIdx, setCurrentIdx] = useState(0);
    const [playerPos, setPlayerPos] = useState({ r: 2, c: 2 });
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [grid, setGrid] = useState<any[][]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [timeLeft, setTimeLeft] = useState(15);

    const isBusy = useRef(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const currentQ = questions[currentIdx];

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

        setGrid(newGrid);
        setPlayerPos({ r: 2, c: 2 });
        setTimeLeft(15);
        isBusy.current = false;
    }, [currentQ, questions]);

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
    }, [currentIdx]);

    const handleAction = useCallback(async (type: "PORTAL" | "TIMEOUT", cell: any) => {
        if (isBusy.current) return;
        isBusy.current = true;

        if (timerRef.current) clearInterval(timerRef.current);

        let isCorrect = (type === "PORTAL" && cell) ? cell.isCorrect : false;

        // 🎯 HITUNG SKOR SECARA LOKAL UNTUK DIKIRIM SEGERA
        let newScore = isCorrect ? score + 100 : score;
        let newLives = isCorrect ? lives : lives - 1;

        if (isCorrect) {
            setScore(newScore);
            toast.success("Tepat Sekali! 🌟");

            // 📡 SINKRONISASI KE TEACHER (REAL-TIME)
            if (roomCode) socket.emit("updateScore", { code: roomCode, score: newScore });
            submitAnswer(realGameId, currentIdx, cell.text, newScore).catch(() => { });
        } else {
            setLives(newLives);
            toast.error(type === "TIMEOUT" ? "Waktu Habis! ⏰" : "Portal Salah! 🐙");
            submitAnswer(realGameId, currentIdx, type === "TIMEOUT" ? "TIMEOUT" : cell?.text, newScore).catch(() => { });
        }

        const currentHistoryItem = { word: cell?.text || "TIMEOUT", isCorrect, time: 15 - timeLeft };
        const updatedHistory = [...history, currentHistoryItem];
        setHistory(updatedHistory);

        setTimeout(() => {
            const isGameOver = newLives <= 0 || currentIdx + 1 >= questions.length;
            if (isGameOver) {
                // 🎯 GUNAKAN VARIABEL LOKAL (newScore & updatedHistory) AGAR TIDAK 0
                const accuracy = Math.round((newScore / (questions.length * 100)) * 100);
                const payload = {
                    scoreValue: newScore,
                    maxScore: questions.length * 100,
                    accuracy,
                    timeSpent: 0,
                    answersDetail: updatedHistory
                };

                // Redundansi simpan ke storage
                sessionStorage.setItem("lastScore", newScore.toString());
                sessionStorage.setItem("lastAccuracy", accuracy.toString());
                sessionStorage.setItem("lastBreakdown", JSON.stringify(updatedHistory));

                finishGame(realGameId, payload).catch(() => { });
                if (onGameOver) onGameOver(newScore, accuracy, updatedHistory);
                else navigate("/student/result", { state: payload });
            } else {
                if (onIntermission) onIntermission();
                setCurrentIdx(prev => prev + 1);
            }
        }, 800);
    }, [score, lives, history, currentIdx, questions.length, realGameId, navigate, onGameOver, onIntermission, timeLeft, roomCode]);

    const movePlayer = useCallback((dr: number, dc: number) => {
        if (isBusy.current || lives <= 0) return;
        setPlayerPos(prev => {
            const nr = Math.max(0, Math.min(4, prev.r + dr));
            const nc = Math.max(0, Math.min(4, prev.c + dc));
            if (nr === prev.r && nc === prev.c) return prev;
            const cell = grid[nr][nc];
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
        <div className="flex flex-col items-center p-6 space-y-6 max-w-2xl mx-auto font-sans select-none">
            {/* HUD HEADER */}
            <div className="w-full flex justify-between bg-white p-6 rounded-[2.5rem] shadow-sm border-2 border-indigo-50">
                <div className="flex flex-col text-center items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nyawa</span>
                    <span className="text-xl">{"❤️".repeat(Math.max(0, lives))}</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Waktu</span>
                    <span className={`text-2xl font-black ${timeLeft <= 5 ? 'text-rose-500 animate-pulse' : 'text-slate-700'}`}>{timeLeft}s</span>
                </div>
                <div className="text-right">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Skor</span>
                    <p className="font-black text-indigo-600 text-2xl">{score}</p>
                </div>
            </div>

            <div className="bg-white p-8 rounded-[3rem] shadow-xl border-2 border-indigo-100 w-full text-center relative overflow-hidden">
                <div className="absolute bottom-0 left-0 h-1 bg-indigo-500 transition-all duration-1000" style={{ width: `${(timeLeft / 15) * 100}%` }} />
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">{currentQ.question}</h2>
            </div>

            <div className="bg-slate-900 p-4 rounded-[3rem] shadow-2xl border-[10px] border-slate-800">
                <div className="grid grid-cols-5 gap-2">
                    {grid.map((row, r) => row.map((cell, c) => (
                        <div key={`${r}-${c}`} className={`w-14 h-14 md:w-20 md:h-20 rounded-2xl flex items-center justify-center transition-all duration-150 ${playerPos.r === r && playerPos.c === c ? 'bg-indigo-500 scale-110 z-10' : 'bg-slate-800/30'}`}>
                            {playerPos.r === r && playerPos.c === c ? <span className="text-4xl animate-bounce">🏃</span> : cell ? <div className="bg-white p-1 rounded-lg text-center leading-tight shadow-sm w-full h-full flex items-center justify-center overflow-hidden"><span className="font-black text-[9px] uppercase break-words px-1">{cell.text}</span></div> : null}
                        </div>
                    )))}
                </div>
            </div>
        </div>
    );
}