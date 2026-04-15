import { useState } from "react"

export default function FlashcardBuilder({ value, onChange }: any) {
    const [cards, setCards] = useState(value?.data?.cards || [])

    function update(newCards: any) {
        setCards(newCards)
        onChange({
            data: { cards: newCards }
        })
    }

    function add() {
        update([...cards, { front: "", back: "" }])
    }

    function change(i: number, key: string, val: string) {
        const copy = [...cards]
        copy[i][key] = val
        update(copy)
    }

    function remove(i: number) {
        update(cards.filter((_: any, index: number) => index !== i))
    }

    return (
        <div className="space-y-6 font-sans">
            <div className="flex justify-between items-center px-2">
                <h3 className="text-xl font-black text-slate-800">Flashcards 🎴</h3>
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Editor Kartu</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cards.map((c: any, i: number) => (
                    <div key={i} className="bg-white p-6 rounded-[2.5rem] border-4 border-slate-50 shadow-sm relative group hover:shadow-xl transition-all">
                        <button
                            onClick={() => remove(i)}
                            className="absolute -top-3 -right-3 w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 font-black"
                        >
                            ✕
                        </button>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-indigo-400 uppercase ml-4 mb-1 block tracking-widest">Sisi Depan (Soal)</label>
                                <textarea
                                    className="w-full bg-slate-50 border-2 border-slate-100 px-5 py-3 rounded-3xl focus:border-indigo-500 outline-none transition-all font-bold resize-none h-20"
                                    placeholder="Tulis pertanyaan..."
                                    value={c.front}
                                    onChange={(e) => change(i, "front", e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-emerald-400 uppercase ml-4 mb-1 block tracking-widest">Sisi Belakang (Jawaban)</label>
                                <textarea
                                    className="w-full bg-emerald-50/30 border-2 border-emerald-100 px-5 py-3 rounded-3xl focus:border-emerald-500 outline-none transition-all font-bold text-emerald-700 resize-none h-20"
                                    placeholder="Tulis jawaban..."
                                    value={c.back}
                                    onChange={(e) => change(i, "back", e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={add}
                className="w-full py-6 bg-indigo-600 text-white rounded-[2.5rem] font-black text-xl shadow-lg shadow-indigo-100 hover:bg-indigo-500 hover:-translate-y-1 transition-all active:scale-95"
            >
                + Buat Kartu Baru
            </button>
        </div>
    )
}