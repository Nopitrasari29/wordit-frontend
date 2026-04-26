import { useState, useEffect, useCallback, useRef } from "react";
import { submitAnswer } from "../../../pages/services/game.service";
import { toast } from "react-hot-toast";

export default function MazeChaseEngine({ data, onGameOver, onIntermission }: { data: any, onGameOver?: any, onIntermission?: any }) {
    const questions = data?.gameJson?.questions || [];

    const [currentIdx, setCurrentIdx] = useState(0);
    const [playerPos, setPlayerPos] = useState({ r: 2, c: 2 });
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [grid, setGrid] = useState<any[][]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [timeLeft, setTimeLeft] = useState(15);

    // 🎯 REFS UNTUK STABILITAS
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

    // 🎯 TIMER LOGIC DENGAN AUTO-FINISH SOAL TERAKHIR
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

    // 🎯 CENTRAL ACTION (Portal & Timeout)
    const handleAction = useCallback((type: "PORTAL" | "TIMEOUT", cell: any) => {
        if (isBusy.current) return;
        isBusy.current = true; // Kunci permanen untuk aksi ini

        if (timerRef.current) clearInterval(timerRef.current);

        let isCorrect = false;
        let word = "TIMEOUT";
        let newScore = score;
        let newLives = lives;

        if (type === "PORTAL" && cell) {
            isCorrect = cell.isCorrect;
            word = cell.text;
            if (isCorrect) {
                newScore += 100;
                setScore(newScore);
                toast.success("Tepat Sekali! 🌟");
                // Submit skor real-time
                submitAnswer(data.id || data._id, currentIdx, word, newScore).catch(() => { });
            } else {
                newLives -= 1;
                setLives(newLives);
                toast.error("Salah Portal! 🐙");
            }
        } else {
            newLives -= 1;
            setLives(newLives);
            toast.error("Waktu Habis! ⏰");
        }

        const newHistory = [...history, { word, isCorrect, time: 15 - timeLeft }];
        setHistory(newHistory);

        // 🎯 LOGIKA PERPINDAHAN (Auto-Next atau Auto-Finish)
        setTimeout(() => {
            const isGameOver = newLives <= 0 || currentIdx + 1 >= questions.length;

            if (isGameOver) {
                const accuracy = Math.round((newScore / (questions.length * 100)) * 100);
                // Simpan ke storage untuk PlayGamePage
                sessionStorage.setItem("lastScore", newScore.toString());
                sessionStorage.setItem("lastAccuracy", accuracy.toString());
                sessionStorage.setItem("lastBreakdown", JSON.stringify(newHistory));

                if (onGameOver) onGameOver(newScore, accuracy, newHistory);
            } else {
                if (onIntermission) onIntermission();
                setCurrentIdx(prev => prev + 1);
            }
        }, 800);
    }, [score, lives, history, currentIdx, questions.length, data, onGameOver, onIntermission, timeLeft]);

    const movePlayer = useCallback((dr: number, dc: number) => {
        if (isBusy.current || lives <= 0) return;

        setPlayerPos(prev => {
            const nr = Math.max(0, Math.min(4, prev.r + dr));
            const nc = Math.max(0, Math.min(4, prev.c + dc));
            if (nr === prev.r && nc === prev.c) return prev;

            const cell = grid[nr][nc];
            if (cell) {
                handleAction("PORTAL", cell);
                return prev;
            }
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
            <div className="w-full flex justify-between bg-white p-6 rounded-[2.5rem] shadow-sm border-2 border-indigo-50">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Nyawa</span>
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