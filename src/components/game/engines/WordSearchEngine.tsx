import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../../../hooks/useSocket";
import { finishGame } from "../../../pages/services/game.service";
import { toast } from "react-hot-toast";

export default function WordSearchEngine({ data }: { data: any }) {
    const navigate = useNavigate();

    // 🔍 Sync: Mendukung data format Array maupun Object
    const gameConfig = useMemo(() => {
        return Array.isArray(data?.gameJson) ? data.gameJson[0] : data?.gameJson;
    }, [data]);

    const size = gameConfig?.gridSize || 8;
    const wordsToFind = useMemo(() => {
        const raw = gameConfig?.words || [];
        return raw.map((w: any) => w.word.toUpperCase().replace(/\s/g, ''));
    }, [gameConfig]);

    const [grid, setGrid] = useState<string[][]>([]);
    const [foundWords, setFoundWords] = useState<string[]>([]);
    const [startCell, setStartCell] = useState<[number, number] | null>(null);
    const [score, setScore] = useState(0);
    const [timeSpent, setTimeSpent] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    // 🏗️ GRID GENERATOR ALGORITHM
    const generateGrid = useCallback(() => {
        if (wordsToFind.length === 0) return;
        let newGrid = Array(size).fill(null).map(() => Array(size).fill(''));
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

        // Place words
        wordsToFind.forEach((word: string) => {
            let placed = false;
            let attempts = 0;
            while (!placed && attempts < 100) {
                const isVertical = Math.random() > 0.5;
                const row = Math.floor(Math.random() * (isVertical ? (size - word.length + 1) : size));
                const col = Math.floor(Math.random() * (isVertical ? size : (size - word.length + 1)));

                let canPlace = true;
                for (let i = 0; i < word.length; i++) {
                    const char = isVertical ? newGrid[row + i][col] : newGrid[row][col + i];
                    if (char !== '' && char !== word[i]) { canPlace = false; break; }
                }

                if (canPlace) {
                    for (let i = 0; i < word.length; i++) {
                        if (isVertical) newGrid[row + i][col] = word[i];
                        else newGrid[row][col + i] = word[i];
                    }
                    placed = true;
                }
                attempts++;
            }
        });

        // Fill remaining
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                if (newGrid[r][c] === '') {
                    newGrid[r][c] = alphabet[Math.floor(Math.random() * 26)];
                }
            }
        }
        setGrid(newGrid);
    }, [wordsToFind, size]);

    useEffect(() => {
        generateGrid();
        const timer = setInterval(() => setTimeSpent(p => p + 1), 1000);
        return () => clearInterval(timer);
    }, [generateGrid]);

    // 🎯 SELECTION LOGIC
    const handleCellClick = (r: number, c: number) => {
        if (!startCell) {
            setStartCell([r, c]);
        } else {
            const [r1, c1] = startCell;
            const [r2, c2] = [r, c];
            let selectedStr = "";

            if (r1 === r2) { // Horizontal
                const start = Math.min(c1, c2);
                const end = Math.max(c1, c2);
                for (let i = start; i <= end; i++) selectedStr += grid[r1][i];
            } else if (c1 === c2) { // Vertical
                const start = Math.min(r1, r2);
                const end = Math.max(r1, r2);
                for (let i = start; i <= end; i++) selectedStr += grid[i][c1];
            }

            const reversed = selectedStr.split('').reverse().join('');
            const foundWord = wordsToFind.find((w: string) => w === selectedStr || w === reversed);

            if (foundWord && !foundWords.includes(foundWord)) {
                const newFound = [...foundWords, foundWord];
                const points = 100;
                const newScore = score + points;

                setFoundWords(newFound);
                setScore(newScore);
                toast.success(`Ditemukan: ${foundWord}! ✨`);

                if (data.shareCode) {
                    socket.emit("updateScore", { code: data.shareCode, score: newScore });
                }

                if (newFound.length === wordsToFind.length) {
                    handleFinish(newFound, newScore);
                }
            } else if (selectedStr !== "") {
                toast.error("Bukan kata target! ❌");
            }
            setStartCell(null);
        }
    };

    const handleFinish = async (finalFound: string[], finalScore: number) => {
        setIsFinished(true);
        const payload = {
            scoreValue: finalScore,
            maxScore: wordsToFind.length * 100,
            accuracy: 100,
            timeSpent: timeSpent,
            answersDetail: finalFound.map(w => ({ word: w, isCorrect: true })),
        };

        try {
            await finishGame(data.id || data._id, payload);
            navigate("/student/result", { state: payload });
        } catch (e) {
            navigate("/student/result", { state: payload });
        }
    };

    if (isFinished) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-widest text-indigo-600">Menyimpan Hasil... 🏆</div>;

    return (
        <div className="flex flex-col items-center p-6 space-y-8 max-w-2xl mx-auto font-sans animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="w-full flex justify-between bg-white p-6 rounded-[2.5rem] shadow-sm border-2 border-indigo-50">
                <div className="flex flex-col font-black">
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest">Ditemukan</span>
                    <span className="text-indigo-600 italic text-xl">{foundWords.length} / {wordsToFind.length}</span>
                </div>
                <div className="flex flex-col items-end font-black text-right">
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest">Waktu</span>
                    <span className="text-slate-700 text-xl">⏱️ {timeSpent}s</span>
                </div>
            </div>

            {/* Word Bank */}
            <div className="flex flex-wrap gap-2 justify-center bg-slate-50 p-4 rounded-3xl w-full">
                {wordsToFind.map((w: string) => (
                    <span key={w} className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase transition-all duration-500 ${foundWords.includes(w)
                            ? 'bg-emerald-500 text-white line-through scale-90 opacity-50'
                            : 'bg-white text-slate-400 border-2 border-slate-100'
                        }`}>
                        {w} {foundWords.includes(w) && "✅"}
                    </span>
                ))}
            </div>

            {/* 🎮 INTERACTIVE GRID */}
            <div className="bg-indigo-600 p-4 rounded-[3.5rem] shadow-2xl border-[12px] border-indigo-500/20">
                <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
                    {grid.map((row, r: number) => row.map((char: string, c: number) => {
                        const isSelected = startCell?.[0] === r && startCell?.[1] === c;
                        return (
                            <button
                                key={`${r}-${c}`}
                                onClick={() => handleCellClick(r, c)}
                                className={`w-8 h-8 md:w-11 md:h-11 rounded-xl font-black text-lg flex items-center justify-center transition-all active:scale-90 ${isSelected
                                        ? 'bg-amber-400 text-white scale-110 shadow-lg rotate-6'
                                        : 'bg-white text-indigo-900 hover:bg-indigo-50'
                                    }`}
                            >
                                {char}
                            </button>
                        );
                    }))}
                </div>
            </div>

            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] animate-bounce bg-slate-100 px-6 py-2 rounded-full">
                Klik huruf awal lalu klik huruf akhir kata 👆
            </p>
        </div>
    );
}