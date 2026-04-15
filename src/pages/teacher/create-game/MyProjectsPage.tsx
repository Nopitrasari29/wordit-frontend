import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../../context/AuthContext"
import { getMyGames, deleteGame, publishGame } from "../../services/game.service"
import { templateIcons } from "../../../data/templateIcons"
import type { Game } from "../../../types/game"

export default function MyProjectsPage() {
    const { token } = useAuth()
    const [games, setGames] = useState<Game[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!token) return
        getMyGames().then(setGames).catch(console.error).finally(() => setLoading(false))
    }, [token])

    async function handleDelete(id: string) {
        if (!token || !confirm("Hapus game ini?")) return
        try { await deleteGame(id); setGames(games.filter(g => g.id !== id)) }
        catch (e: any) { alert(e.message) }
    }

    async function handlePublish(id: string) {
        if (!token) return
        try {
            const updated = await publishGame(id)
            setGames(games.map(g => g.id === id ? { ...g, ...updated } : g))
            alert(`Dipublish! Share Code: ${updated.shareCode}`)
        } catch (e: any) { alert(e.message) }
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center pt-24 font-sans text-slate-400 font-bold">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mr-3"></div>
            Loading Projects...
        </div>
    )

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-24 pt-24 px-6">
            <div className="max-w-6xl mx-auto space-y-10">

                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 gap-6">
                    <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">My Projects 📁</h1>
                    <Link
                        to="/teacher/create/level"
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 rounded-full font-black shadow-[0_8px_20px_rgba(79,70,229,0.3)] hover:-translate-y-1 transition-all"
                    >
                        + Buat Game Baru
                    </Link>
                </div>

                {/* PROJECT LIST */}
                {games.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 font-sans">
                        <p className="text-6xl mb-4">📭</p>
                        <p className="text-slate-500 font-bold text-lg mb-4">Belum ada game buatanmu.</p>
                        <Link to="/teacher/create/level" className="bg-indigo-50 text-indigo-600 px-6 py-3 rounded-full font-black hover:bg-indigo-600 hover:text-white transition-all">
                            Buat game pertamamu sekarang!
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {games.map(g => (
                            <div key={g.id} className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm hover:shadow-xl border border-slate-100 transition-all flex flex-col justify-between group">

                                <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                                                {templateIcons[g.templateType] || "🎮"}
                                            </div>
                                            <div>
                                                <h2 className="font-black text-xl text-slate-800">{g.title}</h2>
                                                <p className="text-slate-500 text-sm font-bold capitalize">
                                                    {g.templateType.replace(/_/g, " ").toLowerCase()} · {g.educationLevel}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 items-center bg-slate-50 p-3 rounded-xl border border-slate-100 font-sans">
                                        <span className={`text-[10px] px-3 py-1.5 rounded-full font-black tracking-widest uppercase ${g.isPublished ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}>
                                            {g.isPublished ? "Published" : "Draft"}
                                        </span>
                                        {g.shareCode && (
                                            <span className="font-mono text-xs bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full font-bold">
                                                Code: {g.shareCode}
                                            </span>
                                        )}
                                        <span className="text-xs text-slate-500 font-bold ml-auto bg-white px-3 py-1.5 rounded-full shadow-sm">
                                            ▶ {g.playCount} plays
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-3 text-sm mt-6 pt-4 border-t border-slate-100 font-bold">
                                    <Link to={`/teacher/game/edit/${g.id}`} className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-full transition-colors flex-1 text-center">Edit</Link>
                                    <Link to={`/teacher/game/preview/${g.id}`} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 px-4 py-2 rounded-full transition-colors flex-1 text-center">Preview</Link>
                                    {!g.isPublished && (
                                        <button onClick={() => handlePublish(g.id)} className="bg-purple-50 hover:bg-purple-100 text-purple-600 px-4 py-2 rounded-full transition-colors flex-1">Publish</button>
                                    )}
                                    <button onClick={() => handleDelete(g.id)} className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-4 py-2 rounded-full transition-colors">Hapus</button>
                                </div>

                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}