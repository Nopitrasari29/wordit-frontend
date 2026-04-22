import { useState } from "react"

export default function SpinWheelEngine({ data }: { data: any }) {
    const questions = data?.gameJson?.questions || []
    const [result, setResult] = useState<any>(null)
    const [spinning, setSpinning] = useState(false)

    function spin() {
        if (questions.length === 0) return
        setSpinning(true)
        setResult(null)
        setTimeout(() => {
            const r = questions[Math.floor(Math.random() * questions.length)]
            setResult(r)
            setSpinning(false)
        }, 2000)
    }

    if (questions.length === 0) return (
        <div className="p-20 text-center text-slate-400 font-black italic uppercase tracking-widest">
            🎡 Belum ada pertanyaan...
        </div>
    )

    return (
        <div className="flex flex-col items-center justify-center p-12 space-y-12 font-sans w-full max-w-xl mx-auto">
            <h2 className="text-4xl font-black text-slate-800 tracking-tighter italic">Spin the Wheel 🎡</h2>

            <div className="relative group">
                <div className={`w-72 h-72 border-[16px] border-indigo-50 rounded-full flex items-center justify-center bg-white shadow-2xl transition-all duration-[2000ms] ease-out ${spinning ? 'rotate-[1800deg] scale-95' : 'rotate-0 scale-100'}`}>
                    <div className="w-full h-full rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center p-3">
                        <div className="bg-white w-full h-full rounded-full flex items-center justify-center text-6xl shadow-inner">
                            🎯
                        </div>
                    </div>
                </div>
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-5xl drop-shadow-xl animate-bounce">👇</div>
            </div>

            <button
                onClick={spin}
                disabled={spinning}
                className="w-full bg-slate-900 hover:bg-indigo-600 disabled:bg-slate-200 text-white font-black text-2xl py-6 rounded-[2.5rem] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3"
            >
                {spinning ? "BERPUTAR..." : "SPIN SEKARANG! 🚀"}
            </button>

            {result && !spinning && (
                <div className="bg-white border-4 border-indigo-600 p-10 rounded-[3.5rem] animate-in zoom-in duration-500 text-center shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
                    <p className="text-slate-400 font-black text-[10px] uppercase mb-3 tracking-[0.3em]">Hasil Spin:</p>
                    <p className="text-slate-800 font-black text-3xl tracking-tight mb-4 leading-tight">"{result.question}"</p>
                    <div className="bg-indigo-50 px-6 py-3 rounded-2xl inline-block">
                        <p className="text-indigo-600 font-black text-sm uppercase">Jawaban: {result.answer}</p>
                    </div>
                </div>
            )}
        </div>
    )
}