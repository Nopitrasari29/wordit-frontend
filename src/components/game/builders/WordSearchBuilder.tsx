import { useState } from "react"

export default function WordSearchBuilder({ value, onChange }: any) {
    const [words, setWords] = useState(value?.data?.words || [])
    const [grid, setGrid] = useState(value?.data?.gridSize || 10)

    function update(newWords: any) {
        setWords(newWords)
        onChange({
            data: {
                gridSize: grid,
                words: newWords
            }
        })
    }

    function remove(i: number) {
        const copy = words.filter((_: any, index: number) => index !== i)
        update(copy)
    }

    return (
        <div className="space-y-8 font-sans">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl">
                        🔍
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-800">Word Search</h3>
                        <p className="text-slate-400 font-bold">Cari kata di grid kotak</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-slate-50 px-6 py-3 rounded-3xl">
                    <label className="font-black text-slate-500 uppercase text-xs">Grid Size</label>
                    <input
                        type="number"
                        className="bg-transparent w-12 text-center font-black text-emerald-600 text-2xl outline-none"
                        value={grid}
                        onChange={(e) => setGrid(Number(e.target.value))}
                    />
                </div>
            </div>

            <div className="bg-slate-50 p-8 rounded-[3rem] border-2 border-dashed border-slate-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {words.map((w: any, i: number) => (
                        <div key={i} className="relative group">
                            <input
                                className="w-full bg-white border-2 border-slate-100 px-4 py-3 rounded-2xl focus:border-emerald-500 outline-none transition-all font-bold text-center uppercase tracking-widest text-slate-700 shadow-sm"
                                placeholder="..."
                                value={w}
                                onChange={(e) => {
                                    const copy = [...words]
                                    copy[i] = e.target.value
                                    update(copy)
                                }}
                            />
                            <button
                                onClick={() => remove(i)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] font-black opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={() => update([...words, ""])}
                        className="bg-emerald-100 text-emerald-600 px-4 py-3 rounded-2xl font-black hover:bg-emerald-600 hover:text-white transition-all border-2 border-emerald-200"
                    >
                        + Tambah
                    </button>
                </div>
            </div>
        </div>
    )
}