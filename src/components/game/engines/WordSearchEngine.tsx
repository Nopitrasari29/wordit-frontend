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
    const size = gameConfig?.gridSize || 8;
    const wordsToFind = useMemo(() => (gameConfig?.words || []).map((w: any) => w.word.toUpperCase()), [gameConfig]);

    const [grid, setGrid] = useState<string[][]>([]);
    const [foundWords, setFoundWords] = useState<string[]>([]);
    const [startCell, setStartCell] = useState<[number, number] | null>(null);
    const [foundCells, setFoundCells] = useState<string[]>([]);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [timeLeft, setTimeLeft] = useState(120);
    const [isFinished, setIsFinished] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const [selection, setSelection] = useState<string[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const generateGrid = useCallback(() => {
        if (wordsToFind.length === 0) return;
        let newGrid = Array(size).fill(null).map(() => Array(size).fill(''));
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

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
    }, [generateGrid]);

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
            return grid[r][c];
        }).join('');

        const reversed = selectedStr.split('').reverse().join('');
        const foundWord = wordsToFind.find((w: string) => (w === selectedStr || w === reversed) && !foundWords.includes(w));

        if (foundWord) {
            const newFound = [...foundWords, foundWord];
            const newScore = score + 100;
            const newHistory = [...history, { word: foundWord, isCorrect: true }];

            setScore(newScore);
            setFoundWords(newFound);
            setFoundCells(prev => [...prev, ...selection]);
            setHistory(newHistory);
            toast.success(`Ditemukan: ${foundWord}! ✨`);

            if (roomCode) socket.emit("updateScore", { code: roomCode, score: newScore });
            submitAnswer(realGameId, wordsToFind.indexOf(foundWord), foundWord, newScore).catch(() => { });

            if (newFound.length === wordsToFind.length) {
                handleFinish(newFound, newScore, newHistory);
            }
        } else if (selection.length > 1) {
            const newLives = lives - 1;
            setLives(newLives);
            toast.error("Bukan itu katanya! ❌");
            if (newLives <= 0) handleFinish(foundWords, score, history);
        }

        setIsDragging(false);
        setStartCell(null);
        setSelection([]);
    };

    const handleFinish = async (finalFound: string[], finalScore: number, finalHistory: any[]) => {
        if (isFinished) return;
        if (onIntermission) onIntermission();
        setIsFinished(true);
        if (timerRef.current) clearInterval(timerRef.current);

        const accuracy = Math.round((finalFound.length / wordsToFind.length) * 100);
        const payload = {
            scoreValue: finalScore,
            maxScore: wordsToFind.length * 100,
            accuracy: accuracy,
            timeSpent: 120 - timeLeft,
            answersDetail: finalHistory.length > 0 ? finalHistory : finalFound.map(w => ({ word: w, isCorrect: true })),
        };

        sessionStorage.setItem("lastScore", finalScore.toString());
        sessionStorage.setItem("lastAccuracy", accuracy.toString());
        sessionStorage.setItem("lastBreakdown", JSON.stringify(payload.answersDetail));

        try {
            await finishGame(realGameId, payload);
        } catch (e) {
            console.error("Gagal simpan skor ke DB, menggunakan fallback navigasi.");
        }

        if (onGameOver) {
            onGameOver(finalScore, accuracy, payload.answersDetail);
        } else {
            navigate("/student/result", { state: payload });
        }
    };

    if (isFinished) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-widest text-indigo-600">Menyimpan Skor... 🏆</div>;

    return (
        <div className="flex flex-col items-center p-6 space-y-8 max-w-2xl mx-auto font-sans">
            <div className="w-full flex justify-between bg-white p-6 rounded-[2.5rem] shadow-sm border-2 border-indigo-50 items-center">
                <div className="flex flex-col font-black">
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest">Nyawa</span>
                    <span className="text-xl">{"❤️".repeat(lives)}</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest">Sisa Waktu</span>
                    <span className={`text-2xl font-black ${timeLeft <= 10 ? 'text-rose-500 animate-pulse' : 'text-slate-700'}`}>
                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </span>
                </div>
                <div className="text-right flex flex-col font-black">
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest">Skor</span>
                    <span className="text-indigo-600 text-2xl">{score}</span>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-center bg-slate-50 p-4 rounded-3xl w-full border-2 border-slate-100">
                {wordsToFind.map((w: string) => (
                    <span key={w} className={`px-4 py-2 rounded-xl font-black text-[10px] transition-all duration-500 ${foundWords.includes(w) ? 'bg-emerald-500 text-white line-through scale-90' : 'bg-white text-slate-400 border-2 border-slate-200'}`}>
                        {w} {foundWords.includes(w) && "✅"}
                    </span>
                ))}
            </div>

            <div 
                className="bg-indigo-600 p-2 sm:p-4 rounded-[2rem] sm:rounded-[3.5rem] shadow-2xl border-[8px] sm:border-[12px] border-indigo-500/20 max-w-full overflow-hidden"
                onMouseLeave={handleMouseUp}
                onMouseUp={handleMouseUp}
                onTouchEnd={handleMouseUp}
            >
                <div className={`grid gap-1 sm:gap-2`} style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
                    {grid.map((row, r: number) => row.map((char: string, c: number) => {
                        const isSelected = selection.includes(`${r}-${c}`);
                        const isFound = foundCells.includes(`${r}-${c}`);
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
                                className={`w-7 h-7 sm:w-9 sm:h-9 md:w-12 md:h-12 rounded-lg sm:rounded-xl font-black text-sm sm:text-base md:text-lg flex items-center justify-center transition-all select-none touch-none ${isFound ? 'bg-emerald-400 text-white' : isSelected ? 'bg-amber-400 text-white scale-110 shadow-lg' : 'bg-white text-indigo-900 hover:bg-indigo-50'}`}
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