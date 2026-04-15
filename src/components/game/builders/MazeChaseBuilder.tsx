import { useState } from "react"

export default function MazeChaseBuilder({ value, onChange }: any) {
    const [mazeSize, setMazeSize] = useState(value?.data?.mazeSize || 10)
    const [words, setWords] = useState(value?.data?.words || [])

    function update(newWords: any, size = mazeSize) {
        setWords(newWords)
        onChange({
            data: {
                mazeSize: size,
                words: newWords
            }
        })
    }

    function addWord() {
        update([...words, ""])
    }

    function change(index: number, val: string) {
        const copy = [...words]
        copy[index] = val
        update(copy)
    }

    function remove(index: number) {
        update(words.filter((_: any, i: number) => i !== index))
    }

    return (
        <div className="space-y-8 font-sans">
            <div className="bg-indigo-50 p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-4 border-2 border-indigo-100">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">🏃</span>
                    <h3 className="text-xl font-black text-indigo-900">Maze Chase Config</h3>
                </div>
                <div className="flex items-center gap-4 bg-white px-6 py-2 rounded-full shadow-sm">
                    <label className="text-sm font-black text-slate-500 uppercase">Maze Size</label>
                    <input
                        type="number"
                        className="w-16 font-black text-indigo-600 outline-none text-xl"
                        value={mazeSize}
                        onChange={(e) => {
                            const size = Number(e.target.value)
                            setMazeSize(size)
                            update(words, size)
                        }}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {words.map((w: any, i: number) => (
                    <div key={i} className="flex gap-2 group">
                        <input
                            className="w-full bg-white border-4 border-slate-50 px-6 py-4 rounded-3xl focus:border-indigo-500 outline-none transition-all font-black text-slate-700 shadow-sm"
                            placeholder={`Jawaban Benar #${i + 1}`}
                            value={w}
                            onChange={(e) => change(i, e.target.value)}
                        />
                        <button
                            onClick={() => remove(i)}
                            className="bg-slate-100 text-slate-400 hover:bg-rose-500 hover:text-white px-4 rounded-3xl transition-all font-black"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>

            <button
                onClick={addWord}
                className="w-full py-5 bg-white border-4 border-indigo-500 text-indigo-500 rounded-[2.5rem] font-black text-lg hover:bg-indigo-500 hover:text-white transition-all shadow-xl shadow-indigo-100"
            >
                + Tambah Target Jawaban
            </button>
        </div>
    )
}