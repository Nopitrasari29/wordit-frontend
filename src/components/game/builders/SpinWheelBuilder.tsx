import { useState } from "react"

export default function SpinWheelBuilder({ value, onChange }: any) {
    const [options, setOptions] = useState(value?.data?.options || [])

    function update(newOptions: any) {
        setOptions(newOptions)
        onChange({
            data: { options: newOptions }
        })
    }

    function add() {
        update([...options, { label: "" }])
    }

    function remove(i: number) {
        update(options.filter((_: any, index: number) => index !== i))
    }

    return (
        <div className="space-y-6 font-sans">
            <div className="text-center mb-8">
                <div className="w-20 h-20 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 animate-spin-slow">
                    🎡
                </div>
                <h3 className="text-2xl font-black text-slate-800">Wheel Options</h3>
                <p className="text-slate-400 font-bold">Tuliskan pilihan yang akan muncul di roda</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {options.map((o: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 bg-slate-50 p-2 pl-6 rounded-full border-2 border-slate-100 focus-within:border-purple-400 transition-all">
                        <span className="font-black text-purple-300">#{i + 1}</span>
                        <input
                            className="w-full bg-transparent px-2 py-2 outline-none font-bold text-slate-700"
                            placeholder="Label Pilihan"
                            value={o.label}
                            onChange={(e) => {
                                const copy = [...options]
                                copy[i].label = e.target.value
                                update(copy)
                            }}
                        />
                        <button
                            onClick={() => remove(i)}
                            className="w-10 h-10 bg-white text-rose-500 rounded-full flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>

            <button
                onClick={add}
                className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-full font-black text-lg shadow-lg shadow-purple-200 transition-all active:scale-95 mt-4"
            >
                + Tambah Pilihan Roda
            </button>
        </div>
    )
}