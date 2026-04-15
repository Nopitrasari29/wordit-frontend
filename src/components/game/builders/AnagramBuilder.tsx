import { useState } from "react"

export default function AnagramBuilder({ value, onChange }: any) {
    const [words, setWords] = useState(value?.data?.words || [])

    function update(newWords: any) {
        setWords(newWords)
        onChange({
            data: {
                words: newWords
            }
        })
    }

    function addWord() {
        update([...words, { word: "", hint: "" }])
    }

    function updateWord(index: number, key: string, val: string) {
        const updated = [...words]
        updated[index][key] = val
        update(updated)
    }

    function remove(index: number) {
        update(words.filter((_: any, i: number) => i !== index))
    }

    return (
        <div className="space-y-6 font-sans">
            <div className="flex justify-between items-center px-2">
                <h3 className="text-xl font-black text-slate-800">Anagram Words 🧩</h3>
                <span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-xs font-black">
                    {words.length} Words
                </span>
            </div>

            <div className="space-y-4">
                {words.map((w: any, i: number) => (
                    <div key={i} className="bg-slate-50 p-4 rounded-[2rem] border-2 border-slate-100 flex flex-col md:flex-row gap-3 items-center animate-fade-in-up">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-black text-slate-400 shrink-0 shadow-sm text-sm">
                            {i + 1}
                        </div>
                        <input
                            className="w-full bg-white border-2 border-slate-100 px-5 py-3 rounded-full focus:border-indigo-500 outline-none transition-all font-bold"
                            placeholder="Tulis Kata (Contoh: GAJAH)"
                            value={w.word}
                            onChange={(e) => updateWord(i, "word", e.target.value)}
                        />
                        <input
                            className="w-full bg-white border-2 border-slate-100 px-5 py-3 rounded-full focus:border-indigo-500 outline-none transition-all font-semibold text-slate-500"
                            placeholder="Petunjuk / Hint"
                            value={w.hint}
                            onChange={(e) => updateWord(i, "hint", e.target.value)}
                        />
                        <button
                            onClick={() => remove(i)}
                            className="bg-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white p-3 rounded-full transition-all shrink-0 font-black"
                        >
                            🗑️
                        </button>
                    </div>
                ))}
            </div>

            <button
                onClick={addWord}
                className="w-full py-4 border-4 border-dashed border-slate-200 rounded-[2rem] text-slate-400 font-black hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
            >
                <span className="text-2xl">+</span> Tambah Kata Baru
            </button>
        </div>
    )
}