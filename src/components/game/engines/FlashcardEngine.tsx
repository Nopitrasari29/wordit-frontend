import { useState } from "react"

export default function FlashcardEngine() {
    const cards = [
        { q: "Capital of France", a: "Paris" },
        { q: "2+2", a: "4" }
    ]

    const [index, setIndex] = useState(0)
    const [show, setShow] = useState(false)
    const card = cards[index]

    return (
        <div className="flex flex-col items-center justify-center p-6 space-y-10 font-sans">
            <h2 className="text-3xl font-black text-slate-800">Flashcards 🎴</h2>

            {/* CARD BODY */}
            <div
                onClick={() => setShow(!show)}
                className={`w-full max-w-md aspect-[4/3] flex items-center justify-center p-8 rounded-[3rem] shadow-2xl cursor-pointer transition-all duration-500 transform hover:scale-105 ${show ? 'bg-indigo-600 text-white rotate-3' : 'bg-white text-slate-800 border-8 border-indigo-50'
                    }`}
            >
                <h3 className="text-3xl md:text-4xl font-black text-center leading-tight">
                    {show ? card.a : card.q}
                </h3>
            </div>

            <div className="flex gap-4">
                <button
                    onClick={() => setShow(!show)}
                    className="bg-slate-800 text-white px-8 py-3 rounded-2xl font-black hover:bg-slate-700 transition-all"
                >
                    Flip Card
                </button>
                <button
                    onClick={() => { setShow(false); setIndex((index + 1) % cards.length) }}
                    className="bg-emerald-500 text-white px-8 py-3 rounded-2xl font-black hover:bg-emerald-400 shadow-lg shadow-emerald-200 transition-all active:scale-95"
                >
                    Next Soal ➔
                </button>
            </div>

            <p className="text-slate-400 font-bold">Kartu {index + 1} dari {cards.length}</p>
        </div>
    )
}