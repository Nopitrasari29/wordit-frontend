import { useState } from "react"

export default function FlashcardEngine({ data }: { data: any }) {
    const cards = data?.gameJson?.cards || []
    const [index, setIndex] = useState(0)
    const [show, setShow] = useState(false)
    const card = cards[index]

    if (cards.length === 0) return (
        <div className="p-20 text-center text-slate-400 font-black italic uppercase tracking-widest">
            🎴 Belum ada kartu...
        </div>
    )

    return (
        <div className="flex flex-col items-center justify-center p-6 space-y-10 font-sans w-full max-w-2xl mx-auto">
            <div className="text-center">
                <h2 className="text-4xl font-black text-slate-800 tracking-tighter italic">Flashcards 🎴</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Ketuk kartu untuk melihat jawaban</p>
            </div>

            <div
                onClick={() => setShow(!show)}
                className={`w-full aspect-[4/3] flex items-center justify-center p-12 rounded-[4rem] shadow-2xl cursor-pointer transition-all duration-700 transform ${
                    show ? 'bg-indigo-600 text-white rotate-1 scale-105' : 'bg-white text-slate-800 border-[12px] border-indigo-50 hover:shadow-indigo-100'
                }`}
            >
                <h3 className={`text-3xl md:text-5xl font-black text-center leading-tight transition-all duration-300 ${show ? 'scale-110' : ''}`}>
                    {show ? card.back : card.front}
                </h3>
            </div>

            <div className="flex items-center gap-6 w-full">
                <button
                    onClick={() => setShow(!show)}
                    className="flex-1 bg-slate-900 text-white px-8 py-5 rounded-[2rem] font-black hover:bg-slate-800 transition-all active:scale-95 shadow-xl"
                >
                    Flip Card 🔄
                </button>
                <button
                    onClick={() => { 
                        setShow(false); 
                        setIndex((index + 1) % cards.length);
                    }}
                    className="flex-1 bg-indigo-600 text-white px-8 py-5 rounded-[2rem] font-black hover:bg-indigo-500 shadow-xl shadow-indigo-100 transition-all active:scale-95"
                >
                    Next Soal ➔
                </button>
            </div>

            <div className="bg-slate-100 px-6 py-2 rounded-full">
                <p className="text-slate-500 font-black text-xs uppercase tracking-widest">Kartu {index + 1} / {cards.length}</p>
            </div>
        </div>
    )
}