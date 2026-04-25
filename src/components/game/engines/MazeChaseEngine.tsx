import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../../../hooks/useSocket";
import { finishGame } from "../../../pages/services/game.service";
import { toast } from "react-hot-toast";

export default function MazeChaseEngine({ data }: { data: any }) {
    const navigate = useNavigate();
    const questions = data?.gameJson?.questions || [];

    const [currentIdx, setCurrentIdx] = useState(0);
    const [playerPos, setPlayerPos] = useState({ r: 2, c: 2 }); // Mulai di tengah grid 5x5
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [timeSpent, setTimeSpent] = useState(0);
    const [grid, setGrid] = useState<any[][]>([]);

    const currentQ = questions[currentIdx];

    // 🏗️ Generate Grid 5x5 dengan Jawaban Acak di Pinggir
    const initLevel = useCallback(() => {
        if (!currentQ) return;
        let newGrid = Array(5).fill(null).map(() => Array(5).fill(null));

        // Letakkan Jawaban Benar & Salah di posisi acak (tepi grid)
        const targets = [
            { text: currentQ.answer, isCorrect: true },
            { text: "Salah 1", isCorrect: false },
            { text: "Salah 2", isCorrect: false },
            { text: "Salah 3", isCorrect: false }
        ].sort(() => Math.random() - 0.5);

        const edgePositions = [[0, 0], [0, 4], [4, 0], [4, 4]];
        edgePositions.forEach((pos, i) => {
            newGrid[pos[0]][pos[1]] = targets[i];
        });

        setGrid(newGrid);
        setPlayerPos({ r: 2, c: 2 }); // Reset posisi pemain ke tengah
    }, [currentQ]);

    useEffect(() => { initLevel(); }, [initLevel]);

    useEffect(() => {
        const timer = setInterval(() => setTimeSpent(p => p + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    // 🏃 Gerakan Karakter
    const movePlayer = useCallback((dr: number, dc: number) => {
        setPlayerPos(prev => {
            const nr = Math.max(0, Math.min(4, prev.r + dr));
            const nc = Math.max(0, Math.min(4, prev.c + dc));

            const cellContent = grid[nr][nc];
            if (cellContent) {
                if (cellContent.isCorrect) {
                    toast.success("Tepat Sekali! 🌟");
                    setScore(s => s + 100);
                    if (currentIdx + 1 < questions.length) {
                        setCurrentIdx(p => p + 1);
                    } else {
                        handleFinish(score + 100);
                    }
                } else {
                    toast.error("Ops, Salah Portal! 🐙");
                    setLives(l => l - 1);
                    if (lives <= 1) handleFinish(score);
                    return { r: 2, c: 2 }; // Balik ke tengah
                }
            }
            return { r: nr, c: nc };
        });
    }, [grid, currentIdx, questions.length, lives, score]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowUp") movePlayer(-1, 0);
            if (e.key === "ArrowDown") movePlayer(1, 0);
            if (e.key === "ArrowLeft") movePlayer(0, -1);
            if (e.key === "ArrowRight") movePlayer(0, 1);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [movePlayer]);

    const handleFinish = async (finalScore: number) => {
        const payload = {
            scoreValue: finalScore,
            maxScore: questions.length * 100,
            accuracy: Math.round((finalScore / (questions.length * 100)) * 100),
            timeSpent,
            answersDetail: questions.map((q: any, i: number) => ({ isCorrect: i <= currentIdx }))
        };
        await finishGame(data.id || data._id, payload);
        navigate("/student/result", { state: payload });
    };

    if (!currentQ) return null;

    return (
        <div className="flex flex-col items-center p-6 space-y-6 max-w-2xl mx-auto font-sans">
            {/* HUD */}
            <div className="w-full flex justify-between bg-white p-6 rounded-[2.5rem] shadow-sm border-2 border-indigo-50">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nyawa</span>
                    <span className="text-xl">{"❤️".repeat(lives)}</span>
                </div>
                <div className="text-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Skor</span>
                    <p className="font-black text-indigo-600">{score}</p>
                </div>
            </div>

            {/* Question Card */}
            <div className="bg-white p-8 rounded-[3rem] shadow-xl border-2 border-indigo-100 w-full text-center">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">{currentQ.question}</h2>
            </div>

            {/* 🎮 MAZE GRID 5x5 */}
            <div className="bg-slate-900 p-4 rounded-[3rem] shadow-2xl border-[10px] border-slate-800">
                <div className="grid grid-cols-5 gap-2">
                    {grid.map((row, r) => row.map((cell, c) => (
                        <div key={`${r}-${c}`} className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-[10px] font-black transition-all ${playerPos.r === r && playerPos.c === c ? 'bg-indigo-500 shadow-lg scale-110 z-10' : 'bg-slate-800/50'
                            }`}>
                            {playerPos.r === r && playerPos.c === c ? (
                                <span className="text-3xl animate-pulse">🏃</span>
                            ) : cell ? (
                                <div className="bg-white text-slate-900 p-2 rounded-lg text-center leading-tight">
                                    {cell.text}
                                </div>
                            ) : null}
                        </div>
                    )))}
                </div>
            </div>

            {/* Mobile Controls */}
            <div className="grid grid-cols-3 gap-2 md:hidden">
                <div /> <button onClick={() => movePlayer(-1, 0)} className="p-4 bg-white rounded-xl shadow">⬆️</button> <div />
                <button onClick={() => movePlayer(0, -1)} className="p-4 bg-white rounded-xl shadow">⬅️</button>
                <button onClick={() => movePlayer(1, 0)} className="p-4 bg-white rounded-xl shadow">⬇️</button>
                <button onClick={() => movePlayer(0, 1)} className="p-4 bg-white rounded-xl shadow">➡️</button>
            </div>

            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Gunakan Tombol Panah di Keyboard untuk Bergerak</p>
        </div>
    );
}