import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { submitAnswer, finishGame } from "../../../pages/services/game.service";
import socket from "../../../hooks/useSocket";
import { toast } from "react-hot-toast";

export default function WordSearchEngine({ data, onGameOver }: { data: any, onGameOver?: any }) {
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

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isBusy = useRef(false);

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
                    handleFinish(foundWords, score, [], true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [generateGrid]);

    const handleCellClick = (r: number, c: number) => {
        if (isFinished || isBusy.current || lives <= 0) return;

        if (!startCell) {
            setStartCell([r, c]);
        } else {
            const [r1, c1] = startCell;
            const [r2, c2] = [r, c];
            let selectedStr = "";
            let cellsInSelection: string[] = [];

            if (r1 === r2) { // Horizontal
                const start = Math.min(c1, c2);
                const end = Math.max(c1, c2);
                for (let i = start; i <= end; i++) {
                    selectedStr += grid[r1][i];
                    cellsInSelection.push(`${r1}-${i}`);
                }
            } else if (c1 === c2) { // Vertical
                const start = Math.min(r1, r2);
                const end = Math.max(r1, r2);
                for (let i = start; i <= end; i++) {
                    selectedStr += grid[i][c1];
                    cellsInSelection.push(`${i}-${c1}`);
                }
            }

            const reversed = selectedStr.split('').reverse().join('');
            const foundWord = wordsToFind.find((w: string) => (w === selectedStr || w === reversed) && !foundWords.includes(w));

            if (foundWord) {
                const newFound = [...foundWords, foundWord];
                const newScore = score + 100;
                const newHistory = [...history, { word: foundWord, isCorrect: true }];

                // 🔄 UPDATE STATE LOKAL SEGERA
                setScore(newScore);
                setFoundWords(newFound);
                setFoundCells(prev => [...prev, ...cellsInSelection]);
                setHistory(newHistory);

                toast.success(`Ditemukan: ${foundWord}! ✨`);

                // Update Teacher via Socket & DB
                if (roomCode) socket.emit("updateScore", { code: roomCode, score: newScore });
                submitAnswer(realGameId, wordsToFind.indexOf(foundWord), foundWord, newScore).catch(() => { });

                if (newFound.length === wordsToFind.length) {
                    handleFinish(newFound, newScore, newHistory);
                }
            } else if (selectedStr !== "") {
                const newLives = lives - 1;
                setLives(newLives);
                toast.error("Bukan itu katanya! ❌");

                if (newLives <= 0) {
                    handleFinish(foundWords, score, history);
                }
            }
            setStartCell(null);
        }
    };

    const handleFinish = async (finalFound: string[], finalScore: number, finalHistory: any[], isTimeout = false) => {
        if (isFinished) return;
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

        // 🎯 REDUNDANSI: Simpan skor ke storage agar Result Page tidak 0
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

            <div className="bg-indigo-600 p-4 rounded-[3.5rem] shadow-2xl border-[12px] border-indigo-500/20">
                <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
                    {grid.map((row, r: number) => row.map((char: string, c: number) => {
                        const isSelected = startCell?.[0] === r && startCell?.[1] === c;
                        const isFound = foundCells.includes(`${r}-${c}`);
                        return (
                            <button key={`${r}-${c}`} onClick={() => handleCellClick(r, c)} className={`w-8 h-8 md:w-11 md:h-11 rounded-xl font-black text-lg flex items-center justify-center transition-all ${isFound ? 'bg-emerald-400 text-white' : isSelected ? 'bg-amber-400 text-white scale-110 shadow-lg' : 'bg-white text-indigo-900 hover:bg-indigo-50'}`}>
                                {char}
                            </button>
                        );
                    }))}
                </div>
            </div>
        </div>
    );
}