import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { submitAnswer, finishGame } from "../../../pages/services/game.service";
import socket from "../../../hooks/useSocket";
import { toast } from "react-hot-toast";

export default function WordSearchEngine({ data, onGameOver, onIntermission }: { data: any, onGameOver?: any, onIntermission?: () => void }) {
    const navigate = useNavigate();
    const realGameId = data?.id || data?._id;
    const roomCode = data?.shareCode || "";

    const gameConfig = useMemo(() => Array.isArray(data?.gameJson) ? data.gameJson[0] : data?.gameJson, [data]);
    const wordsToFind = useMemo(() => {
        return (gameConfig?.words || [])
            .map((w: any) => {
                const wordVal = w?.word || w?.front || w?.text || "";
                return typeof wordVal === 'string' ? wordVal.toUpperCase() : "";
            })
            .filter((w: string) => w.trim().length > 0);
    }, [gameConfig]);

    const size = useMemo(() => {
        const longestWord = wordsToFind.reduce((max: number, w: string) => Math.max(max, w.length), 0);
        const configSize = gameConfig?.gridSize ? Number(gameConfig.gridSize) : 8;
        return Math.max(configSize, longestWord + 1);
    }, [gameConfig, wordsToFind]);

    const [grid, setGrid] = useState<string[][]>([]);
    const [foundWords, setFoundWords] = useState<string[]>([]);
    const [startCell, setStartCell] = useState<[number, number] | null>(null);
    const [foundCells, setFoundCells] = useState<string[]>([]);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [timeLeft, setTimeLeft] = useState(gameConfig?.timeLimit ? Number(gameConfig.timeLimit) : 120);
    const [isFinished, setIsFinished] = useState(false);
    const isSavingRef = useRef(false);
    const [history, setHistory] = useState<any[]>([]);
    const [selection, setSelection] = useState<string[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const handleFinish = useCallback(async (finalFound: string[], finalScore: number, finalHistory: any[]) => {
        if (isSavingRef.current) return;
        isSavingRef.current = true;
        if (isFinished) return;
        if (onIntermission) onIntermission();
        setIsFinished(true);
        if (timerRef.current) clearInterval(timerRef.current);

        const maxScoreConfig = Number(gameConfig?.maxScore);
        const accuracy = wordsToFind.length > 0
            ? Math.round((finalFound.length / wordsToFind.length) * 100)
            : 0;
        const payload = {
            scoreValue: finalScore,
            maxScore: maxScoreConfig || wordsToFind.length * 100,
            accuracy: accuracy,
            timeSpent: (gameConfig?.timeLimit ? Number(gameConfig.timeLimit) : 120) - timeLeft,
            answersDetail: finalHistory.length > 0 ? finalHistory : finalFound.map(w => ({ word: w, isCorrect: true })),
        };

        sessionStorage.setItem("lastScore", finalScore.toString());
        sessionStorage.setItem("lastAccuracy", accuracy.toString());
        sessionStorage.setItem("lastBreakdown", JSON.stringify(payload.answersDetail));

        if (onGameOver) {
            onGameOver(finalScore, accuracy, payload.answersDetail);
            return;
        }

        try {
            await finishGame(realGameId, payload);
        } catch (e) {
            console.error("Gagal simpan skor ke DB");
        }

        navigate("/student/result", { state: payload });
    }, [isFinished, onGameOver, onIntermission, realGameId, wordsToFind, gameConfig, timeLeft, navigate]);

    const generateGrid = useCallback(() => {
        if (wordsToFind.length === 0) return;
        let newGrid = Array(size).fill(null).map(() => Array(size).fill(''));
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

        wordsToFind.forEach((word: string) => {
            let placed = false;
            let attempts = 0;
            while (!placed && attempts < 100) {
                const isVertical = Math.random() > 0.5;
                const rowLimit = isVertical ? (size - word.length + 1) : size;
                const colLimit = isVertical ? size : (size - word.length + 1);
                const row = rowLimit > 0 ? Math.floor(Math.random() * rowLimit) : 0;
                const col = colLimit > 0 ? Math.floor(Math.random() * colLimit) : 0;
                let canPlace = true;
                for (let i = 0; i < word.length; i++) {
                    const rowIdx = isVertical ? row + i : row;
                    const colIdx = isVertical ? col : col + i;
                    if (rowIdx < 0 || rowIdx >= size || colIdx < 0 || colIdx >= size || !newGrid[rowIdx]) {
                        canPlace = false;
                        break;
                    }
                    const char = newGrid[rowIdx][colIdx];
                    if (char !== '' && char !== word[i]) { canPlace = false; break; }
                }
                if (canPlace) {
                    for (let i = 0; i < word.length; i++) {
                        const rowIdx = isVertical ? row + i : row;
                        const colIdx = isVertical ? col : col + i;
                        if (newGrid[rowIdx]) {
                            newGrid[rowIdx][colIdx] = word[i];
                        }
                    }
                    placed = true;
                }
                attempts++;
            }
        });

        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                if (newGrid[r][c] === '') newGrid[r][c] = alphabet[Math.floor(Math.random() * 26)];
            }
        }
        setGrid(newGrid);
    }, [wordsToFind, size]);

    useEffect(() => {
        generateGrid();
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    handleFinish(foundWords, score, []);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [generateGrid, foundWords, score, handleFinish]);

    const getCellsBetween = (start: [number, number], end: [number, number]): string[] => {
        const cells: string[] = [];
        const [r1, c1] = start;
        const [r2, c2] = end;

        if (r1 === r2) { // Horizontal
            const s = Math.min(c1, c2);
            const e = Math.max(c1, c2);
            for (let i = s; i <= e; i++) cells.push(`${r1}-${i}`);
        } else if (c1 === c2) { // Vertical
            const s = Math.min(r1, r2);
            const e = Math.max(r1, r2);
            for (let i = s; i <= e; i++) cells.push(`${i}-${c1}`);
        }
        return cells;
    };

    const handleMouseDown = (r: number, c: number) => {
        if (isFinished || lives <= 0) return;
        setIsDragging(true);
        setStartCell([r, c]);
        setSelection([`${r}-${c}`]);
    };

    const handleMouseEnter = (r: number, c: number) => {
        if (!isDragging || !startCell) return;
        const currentCells = getCellsBetween(startCell, [r, c]);
        setSelection(currentCells);
    };

    const handleMouseUp = () => {
        if (!isDragging || !startCell || selection.length === 0) {
            setIsDragging(false);
            setStartCell(null);
            setSelection([]);
            return;
        }

        let selectedStr = selection.map((id: string) => {
            const [r, c] = id.split('-').map(Number);
            return grid[r]?.[c] || "";
        }).join('');

        const reversed = selectedStr.split('').reverse().join('');
        const foundWord = wordsToFind.find((w: string) => (w === selectedStr || w === reversed) && !foundWords.includes(w));

        if (foundWord) {
             const newFound = [...foundWords, foundWord];
             const maxScoreConfig = Number(gameConfig?.maxScore);
             const totalQuestions = wordsToFind.length;
             let points = 100;
             if (maxScoreConfig && maxScoreConfig > 0 && totalQuestions > 0) {
                 if (newFound.length === totalQuestions) {
                     points = maxScoreConfig - score;
                 } else {
                     points = Math.floor(maxScoreConfig / totalQuestions);
                 }
             }
             const newScore = score + points;
             const newHistory = [...history, { word: foundWord, isCorrect: true }];

             setScore(newScore);
             setFoundWords(newFound);
             setFoundCells(prev => [...prev, ...selection]);
             setHistory(newHistory);
             toast.success(`Ditemukan: ${foundWord}! ✨`);

            if (roomCode) {
                const accuracy = Math.round((newFound.length / wordsToFind.length) * 100);
                socket.emit("updateScore", {
                    code: roomCode,
                    score: newScore,
                    accuracy,
                    progress: `${newFound.length}/${wordsToFind.length}`,
                });
            }
            submitAnswer(realGameId, wordsToFind.indexOf(foundWord), foundWord, newScore).catch(() => { });

            if (newFound.length === wordsToFind.length) {
                handleFinish(newFound, newScore, newHistory);
            }
        } else if (selection.length > 1) {
            const newLives = lives - 1;
            setLives(newLives);
            toast.error("Bukan itu katanya! ❌");
            if (newLives <= 0) {
                handleFinish(foundWords, score, history);
            }
        }

        setIsDragging(false);
        setStartCell(null);
        setSelection([]);
    };

    if (wordsToFind.length === 0) {
        return <div className="p-10 text-center animate-pulse text-indigo-650 font-bold">Menyiapkan permainan... 🔎</div>;
    }

    if (isFinished) {
        return <div className="p-20 text-center font-black animate-pulse uppercase tracking-widest text-indigo-600">Menyimpan Skor... 🏆</div>;
    }

    return (
        <div className="flex flex-col items-center p-6 space-y-6 max-w-2xl mx-auto font-sans select-none w-full">
            {/* Play Instructions */}
            <div className="w-full bg-indigo-50/75 backdrop-blur-md border border-indigo-100 rounded-2xl p-4 text-center">
                <p className="text-xs font-bold text-indigo-950">
                    🔎 <span>Cari dan seret (drag) huruf-huruf pada papan untuk menyusun kata yang sesuai dengan daftar di bawah!</span>
                </p>
            </div>

            {/* HUD HEADER */}
            <div className="w-full flex justify-between bg-slate-900/95 backdrop-blur-md p-5 rounded-[2rem] border border-slate-800 text-white items-center shadow-lg">
                <div className="flex flex-col font-black">
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest mb-1">Nyawa</span>
                    <div className="flex gap-0.5">
                        {[...Array(3)].map((_, i) => (
                            <span key={i} className={`text-sm transition-all duration-300 ${i < lives ? 'scale-100' : 'grayscale opacity-20 scale-75'}`}>❤️</span>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest">Sisa Waktu</span>
                    <span className={`text-xl font-black px-4 py-0.5 rounded-full border ${timeLeft <= 10 ? 'text-rose-500 border-rose-500/20 bg-rose-500/10 animate-pulse' : 'text-indigo-300 border-indigo-500/10 bg-indigo-500/5'}`}>
                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </span>
                </div>
                <div className="text-right flex flex-col font-black">
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest mb-0.5">Skor</span>
                    <span className="text-indigo-400 text-xl">{score}</span>
                </div>
            </div>

            {/* TARGET WORDS PANELS */}
            <div className="flex flex-wrap gap-2 justify-center bg-white p-4 rounded-2xl w-full border-2 border-indigo-50 shadow-sm">
                {wordsToFind.map((w: string) => (
                    <span key={w} className={`px-4 py-1.5 rounded-xl font-black text-xs transition-all duration-550 border ${foundWords.includes(w) ? 'bg-emerald-500 border-emerald-500 text-white line-through scale-90' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                        {w} {foundWords.includes(w) && "✅"}
                    </span>
                ))}
            </div>

            {/* WORD GRID CONTAINER */}
            <div 
                className="bg-slate-950 p-3 rounded-[2.5rem] shadow-2xl border-[10px] border-slate-900 max-w-full overflow-hidden shadow-indigo-500/5"
                onMouseLeave={handleMouseUp}
                onMouseUp={handleMouseUp}
                onTouchEnd={handleMouseUp}
            >
                <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
                    {grid.map((row, r: number) => row.map((char: string, c: number) => {
                        const isSelected = selection.includes(`${r}-${c}`);
                        const isFound = foundCells.includes(`${r}-${c}`);
                        
                        let cellClass = "bg-slate-900 border border-slate-800/60 text-slate-300 hover:bg-slate-800/80 hover:text-white";
                        if (isFound) {
                            cellClass = "bg-emerald-500 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]";
                        } else if (isSelected) {
                            cellClass = "bg-indigo-500 border-indigo-400 text-white scale-105 shadow-[0_0_12px_rgba(99,102,241,0.3)]";
                        }

                        return (
                            <button 
                                key={`${r}-${c}`} 
                                data-r={r}
                                data-c={c}
                                onMouseDown={() => handleMouseDown(r, c)}
                                onMouseEnter={() => handleMouseEnter(r, c)}
                                onTouchStart={() => handleMouseDown(r, c)}
                                onTouchMove={(e) => {
                                    const touch = e.touches[0];
                                    const element = document.elementFromPoint(touch.clientX, touch.clientY);
                                    if (element && element.hasAttribute('data-r')) {
                                        const tr = parseInt(element.getAttribute('data-r')!);
                                        const tc = parseInt(element.getAttribute('data-c')!);
                                        handleMouseEnter(tr, tc);
                                    }
                                }}
                                className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl font-black text-sm sm:text-base md:text-xl flex items-center justify-center transition-all select-none touch-none ${cellClass}`}
                            >
                                {char}
                            </button>
                        );
                    }))}
                </div>
            </div>
        </div>
    );
}
