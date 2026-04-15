import { useState } from "react"

export default function HangmanBuilder({ value, onChange }: any) {
    const [words, setWords] = useState(value?.data?.words || [])

    function update(newWords: any) {
        setWords(newWords)
        onChange({
            data: { words: newWords }
        })
    }

    function add() {
        update([...words, { word: "", hint: "" }])
    }

    function change(i: number, key: string, val: string) {
        const copy = [...words]
        copy[i][key] = val
        update(copy)
    }

    // Logic remove ditambahkan agar user bisa menghapus (tidak ada di logic asli tapi sangat dibutuhkan UI)
    function remove(i: number) {
        update(words.filter((_: any, index: number) => index !== i))
    }

    return (
        <div className="space-y-6 font-sans">
            <h3 className="text-xl font-black text-slate-800 ml-2 text-center md:text-left">Hangman Words 🧗</h3>

            <div className="grid grid-cols-1 gap-4">
                {words.map((w: any, i: number) => (
                    <div key={i} className="bg-slate-900 p-5 rounded-[2rem] flex flex-col md:flex-row gap-4 items-center border-b-4 border-slate-800">
                        <div className="bg-white/10 text-white w-10 h-10 rounded-full flex items-center justify-center font-black shrink-0">
                            {i + 1}
                        </div>
                        <input
                            className="w-full bg-white/5 border-2 border-white/10 px-6 py-3 rounded-full text-white focus:border-amber-400 outline-none transition-all font-black tracking-widest uppercase placeholder:normal-case placeholder:font-normal placeholder:tracking-normal"
                            placeholder="KATA"
                            value={w.word}
                            onChange={(e) => change(i, "word", e.target.value)}
                        />
                        <input
                            className="w-full bg-white/5 border-2 border-white/10 px-6 py-3 rounded-full text-slate-400 focus:border-amber-400 outline-none transition-all font-bold"
                            placeholder="Petunjuk Rahasia"
                            value={w.hint}
                            onChange={(e) => change(i, "hint", e.target.value)}
                        />
                        <button
                            onClick={() => remove(i)}
                            className="text-rose-400 hover:text-rose-500 font-black px-2"
                        >
                            🗑️
                        </button>
                    </div>
                ))}
            </div>

            <button
                onClick={add}
                className="w-full py-4 bg-amber-400 hover:bg-amber-300 text-amber-900 rounded-full font-black text-lg transition-all shadow-[0_6px_0_rgb(180,130,0)] active:translate-y-1 active:shadow-none"
            >
                + Tambah Kata
            </button>
        </div>
    )
}