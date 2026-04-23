import { useState } from "react"
import socket from "../../../hooks/useSocket"
import { submitAnswer } from "../../../pages/services/game.service"

export default function MazeChaseEngine({ data }: { data: any, onIntermission?: () => void }) {
    const gameId = data?.id || ""
    const roomCode = data?.shareCode || ""
    const [score, setScore] = useState(0)
    return (
        <div className="flex flex-col items-center justify-center p-12 space-y-8 font-sans text-center w-full max-w-2xl mx-auto">
            <div className="bg-indigo-100 text-indigo-600 w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-5xl shadow-inner animate-bounce">
                🏃
            </div>
            <div>
                <h2 className="text-4xl font-black text-slate-800 tracking-tighter italic">Maze Chase</h2>
                <p className="text-indigo-400 font-black uppercase tracking-[0.3em] text-[10px] mt-2 italic">
                    "{data?.title || 'Game Maze'}"
                </p>
            </div>

            <div className="bg-slate-900 p-8 rounded-[4rem] shadow-2xl border-[12px] border-slate-800 w-full relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                {/* Visual Grid Arcade */}
                <div className="grid grid-cols-4 gap-4 text-4xl relative z-10">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className={`p-6 rounded-[2rem] shadow-inner transition-all duration-500 ${i === 5 ? 'bg-white scale-110 shadow-indigo-500/50' : 'bg-slate-800 opacity-30'}`}>
                            {i === 5 ? '🙂' : '🟦'}
                        </div>
                    ))}
                </div>
            </div>
            <div className="bg-amber-50 border-2 border-amber-100 px-8 py-4 rounded-full flex items-center gap-3 w-full justify-between">
                <div className="flex items-center gap-3">
                    <span className="animate-pulse">🚧</span>
                    <p className="text-amber-600 font-black text-[10px] uppercase tracking-widest text-left">
                        Fitur gameplay sedang dalam sinkronisasi AI
                    </p>
                </div>
                
                <button 
                    onClick={async () => {
                        const newScore = score + 10;
                        setScore(newScore);

                        if (roomCode) {
                            socket.emit("updateScore", { code: roomCode, score: newScore });
                        }

                        if (gameId) {
                            try {
                                await submitAnswer(gameId, 0, "MAZE_COMPLETED", 10);
                            } catch (e) {
                                console.error(e);
                            }
                        }
                    }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-6 py-2 rounded-xl text-xs uppercase tracking-widest transition-all active:scale-95"
                >
                    Selesaikan Dummy (+10 Skor)
                </button>
            </div>
            
            {/* Tampilkan Skor */}
            <div className="absolute top-6 right-8 bg-indigo-600 px-4 py-2 rounded-xl border-2 border-indigo-500 font-black text-white text-sm shadow-xl">
                Skor: {score}
            </div>
        </div>
    );
}