import { useState, useMemo } from "react"
import RankingOverlay from "../common/RankingOverlay"
import { QuizWordItem } from "../../../types/game"

interface AnagramProps {
    data: {
        gameJson?: { // ✅ Tambahkan ? agar opsional
            words?: QuizWordItem[] // ✅ Tambahkan ? agar opsional
        }
    }
}

export default function AnagramEngine({ data }: AnagramProps) {
    /**
     * 🎯 FIX UTAMA: 
     * Gunakan optional chaining (?.) agar jika data atau gameJson kosong, 
     * kodingan tidak langsung "meledak" (error putih).
     */
    const quizWords = data?.gameJson?.words || []
    
    const [currentIndex, setCurrentIndex] = useState(0)
    const [answer, setAnswer] = useState("")
    const [score, setScore] = useState(0)
    const [isFinished, setIsFinished] = useState(false)

    // Kata aktif saat ini dengan pengamanan extra
    const currentQuestion = quizWords[currentIndex]
    const targetWord = currentQuestion?.word?.toUpperCase() || ""

    const shuffled = useMemo(() => {
        if (!targetWord) return []
        const letters = targetWord.split("")
        for (let i = letters.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [letters[i], letters[j]] = [letters[j], letters[i]]
        }
        if (letters.join("") === targetWord && targetWord.length > 1) {
            return targetWord.split("").reverse()
        }
        return letters
    }, [targetWord, currentIndex])

    // ✅ Tampilkan Loader jika data belum siap (mencegah error saat render)
    if (!quizWords || quizWords.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-10 text-slate-400 font-bold italic">
                <div className="animate-spin text-4xl mb-4">⌛</div>
                Menyiapkan soal kuis...
            </div>
        )
    }

    function submit() {
        if (answer.toUpperCase() === targetWord) {
            setScore(prev => prev + 10)
            setAnswer("")

            if (currentIndex < quizWords.length - 1) {
                setCurrentIndex(prev => prev + 1)
            } else {
                setIsFinished(true)
            }
        } else {
            alert("Jawaban kurang tepat, coba lagi ya! ❌")
        }
    }

    if (isFinished) {
        return (
            <RankingOverlay
                players={[
                    { name: "Andi", score: 100 },
                    { name: "Budi", score: 80 },
                    { name: "Siswa Terbaik", score: score }
                ]}
            />
        )
    }

    return (
        <div className="flex flex-col items-center justify-center p-6 space-y-8 font-sans w-full max-w-2xl mx-auto">
            <div className="text-center">
                <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Arrange the Letters 🧩</h2>
                <p className="text-indigo-600 font-black bg-indigo-50 px-4 py-2 rounded-xl mb-4 border-2 border-indigo-100 italic">
                    " {currentQuestion?.hint || "Tidak ada petunjuk"} "
                </p>
                <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">
                    Soal {currentIndex + 1} dari {quizWords.length}
                </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
                {shuffled.map((letter, i) => (
                    <div 
                        key={`${currentIndex}-${i}`} 
                        className="w-14 h-14 md:w-16 md:h-16 bg-white border-4 border-indigo-100 rounded-2xl flex items-center justify-center text-3xl font-black text-indigo-600 shadow-sm animate-bounce" 
                        style={{ animationDelay: `${i * 0.1}s` }}
                    >
                        {letter}
                    </div>
                ))}
            </div>

            <div className="w-full flex flex-col items-center gap-4">
                <input
                    className="w-full max-w-md bg-slate-50 border-4 border-slate-100 px-6 py-4 rounded-3xl text-center text-2xl font-black text-slate-700 focus:border-indigo-500 outline-none transition-all uppercase placeholder:normal-case placeholder:font-medium"
                    placeholder="Ketik jawabanmu..."
                    autoFocus
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submit()}
                />

                <button
                    onClick={submit}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xl px-12 py-4 rounded-3xl shadow-[0_10px_0_rgb(67,56,202)] hover:translate-y-1 hover:shadow-[0_6px_0_rgb(67,56,202)] active:translate-y-2 active:shadow-none transition-all uppercase tracking-widest"
                >
                    Kirim Jawaban! 🚀
                </button>
            </div>

            <div className="bg-white border-2 border-slate-100 px-6 py-2 rounded-full font-black text-slate-500 shadow-sm">
                Skor Saat Ini: <span className="text-indigo-600">{score}</span>
            </div>
        </div>
    )
}