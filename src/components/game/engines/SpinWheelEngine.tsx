import { useState } from "react"

export default function SpinWheelEngine() {
    const items = ["Question 1", "Question 2", "Question 3"]
    const [result, setResult] = useState("")
    const [spinning, setSpinning] = useState(false)

    function spin() {
        setSpinning(true)
        setTimeout(() => {
            const r = items[Math.floor(Math.random() * items.length)]
            setResult(r)
            setSpinning(false)
        }, 1000)
    }

    return (
        <div className="flex flex-col items-center justify-center p-10 space-y-10 font-sans">
            <h2 className="text-3xl font-black text-slate-800">Spin the Wheel 🎡</h2>

            <div className="relative">
                {/* Visualizer Roda Sederhana */}
                <div className={`w-64 h-64 border-[12px] border-purple-100 rounded-full flex items-center justify-center bg-white shadow-2xl transition-all duration-1000 ${spinning ? 'rotate-[1080deg]' : ''}`}>
                    <div className="w-full h-full rounded-full bg-gradient-to-tr from-purple-500 via-indigo-500 to-blue-500 flex items-center justify-center p-2">
                        <div className="bg-white w-full h-full rounded-full flex items-center justify-center text-4xl">
                            🎯
                        </div>
                    </div>
                </div>
                {/* Penunjuk Roda */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-4xl drop-shadow-md">⬇️</div>
            </div>

            <button
                onClick={spin}
                disabled={spinning}
                className="bg-purple-600 hover:bg-purple-500 disabled:bg-slate-300 text-white font-black text-2xl px-16 py-5 rounded-full shadow-lg transition-all active:scale-95"
            >
                {spinning ? "Spinning..." : "SPIN!"}
            </button>

            {result && !spinning && (
                <div className="bg-indigo-50 border-4 border-indigo-200 p-6 rounded-[2rem] animate-fade-in-up">
                    <p className="text-indigo-600 font-black text-xl text-center uppercase tracking-widest">{result}</p>
                </div>
            )}
        </div>
    )
}