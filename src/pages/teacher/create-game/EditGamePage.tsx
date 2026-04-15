import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { getGame, updateGame } from "../../services/game.service"
import GameBuilderRouter from "../../../components/game/GameBuilderRouter"

export default function EditGamePage() {
    const { id } = useParams()
    const [game, setGame] = useState<any>(null)

    useEffect(() => {
        async function load() {
            const data = await getGame(id!)
            setGame(data)
        }
        load()
    }, [id])

    if (!game) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 font-sans">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                <p className="font-bold text-slate-500 animate-pulse">Memuat Game...</p>
            </div>
        )
    }

    async function save() {
        await updateGame(id!, {
            gameJson: game.gameJson
        })
        alert("Game berhasil disimpan! ✨")
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-24 pt-24 px-6">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* HEADER SECTION */}
                <div className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl">
                            ⚙️
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Edit Game</h1>
                            <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">{game.templateType}</p>
                        </div>
                    </div>

                    <button
                        onClick={save}
                        className="bg-emerald-500 hover:bg-emerald-400 text-white px-10 py-4 rounded-full font-black text-lg shadow-lg shadow-emerald-100 hover:-translate-y-1 transition-all active:scale-95"
                    >
                        Save Changes
                    </button>
                </div>

                {/* EDITOR SECTION */}
                <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-slate-50">
                    <GameBuilderRouter
                        templateType={game.templateType}
                        value={game.gameJson}
                        onChange={(json: any) => setGame({ ...game, gameJson: json })}
                    />
                </div>
            </div>
        </div>
    )
}