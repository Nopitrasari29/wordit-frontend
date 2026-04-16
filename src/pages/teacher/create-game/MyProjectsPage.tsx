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
        async function load() {
            try {
                const data = await getMyGames()
                setGames(data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [token])

    async function handleDelete(id: string) {
        if (!confirm("Hapus game ini permanen?")) return
        try {
            await deleteGame(id)
            setGames(games.filter(g => g.id !== id))
        } catch (e: any) {
            alert(e.message)
        }
    }

    async function handlePublish(id: string) {
        try {
            const updated = await publishGame(id)
            setGames(games.map(g => g.id === id ? { ...g, ...updated } : g))
            alert(`Berhasil! Share Code: ${updated.shareCode}`)
        } catch (e: any) {
            alert(e.message)
        }
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans text-slate-400 font-bold">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mr-3"></div>
            Loading Projects...
        </div>
    )

    return (
        /* PERBAIKAN UTAMA: 
           Hapus pt-28 atau pt-24 di sini karena MainLayout sudah memberikan pt-28.
           Kita hanya gunakan padding kecil agar tidak menempel banget ke navbar.
        */
        <div className="min-h-screen bg-slate-50 font-sans pb-24 pt-4 px-6 relative overflow-hidden">

            {/* Dekorasi Background Lembut */}
            <div className="absolute top-0 -left-10 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-30"></div>

            <div className="max-w-6xl mx-auto space-y-10 relative z-10">

                {/* HEADER SECTION */}
                <div className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">My Projects 📁</h1>
                        <p className="text-slate-400 font-black text-[10px] mt-1 uppercase tracking-widest">Total: {games.length} Games</p>
                    </div>
                    <Link
                        to="/teacher/create/level"
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-full font-black shadow-lg shadow-indigo-100 hover:-translate-y-1 transition-all active:scale-95"
                    >
                        + Buat Game Baru
                    </Link>
                </div>

                {/* PROJECT GRID */}
                {games.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-[3rem] shadow-sm border border-slate-100 font-sans">
                        <div className="text-7xl mb-6">🏜️</div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2">Projek Masih Kosong</h3>
                        <p className="text-slate-400 font-bold mb-8">Mulailah dengan membuat materi interaktif pertamamu.</p>
                        <Link to="/teacher/create/level" className="bg-indigo-50 text-indigo-600 px-8 py-4 rounded-full font-black hover:bg-indigo-600 hover:text-white transition-all">
                            Buat Sekarang
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {games.map(g => (
                            <div key={g.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm hover:shadow-2xl border border-slate-100 transition-all duration-300 flex flex-col justify-between group">
                                <div className="space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-5">
                                            <div className="w-16 h-16 bg-slate-50 text-indigo-600 rounded-2xl flex items-center justify-center text-4xl group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                                                {templateIcons[g.templateType] || "🎮"}
                                            </div>
                                            <div>
                                                <h2 className="font-black text-2xl text-slate-800 tracking-tight">{g.title}</h2>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="bg-indigo-50 text-indigo-600 text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest">
                                                        {g.templateType.replace(/_/g, " ")}
                                                    </span>
                                                    <span className="text-slate-300 font-black text-xs">•</span>
                                                    <span className="text-slate-400 font-bold text-xs uppercase">{g.educationLevel}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-3 items-center bg-slate-50/80 p-4 rounded-2xl border border-slate-100 font-sans">
                                        <span className={`text-[10px] px-4 py-2 rounded-full font-black tracking-widest uppercase ${g.isPublished ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-amber-50 text-amber-600 border border-amber-100"}`}>
                                            {g.isPublished ? "✅ Published" : "📝 Draft"}
                                        </span>
                                        {g.shareCode && (
                                            <span className="font-mono text-xs bg-white text-indigo-600 px-4 py-2 rounded-full font-black shadow-sm border border-slate-100">
                                                ID: {g.shareCode}
                                            </span>
                                        )}
                                        <div className="ml-auto text-xs font-black text-slate-400">
                                            <span className="text-slate-800">{g.playCount}</span> PLAYS
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-3 text-sm mt-8 pt-6 border-t border-slate-50 font-black">
                                    <Link to={`/teacher/game/edit/${g.id}`} className="bg-slate-900 text-white px-6 py-3 rounded-full hover:bg-indigo-600 transition-all flex-1 text-center shadow-lg shadow-slate-200">
                                        Edit
                                    </Link>
                                    <Link to={`/teacher/game/preview/${g.id}`} className="bg-white text-slate-700 border-2 border-slate-100 px-6 py-3 rounded-full hover:bg-slate-50 transition-all flex-1 text-center">
                                        Preview
                                    </Link>
                                    {!g.isPublished && (
                                        <button onClick={() => handlePublish(g.id)} className="bg-indigo-50 text-indigo-600 px-6 py-3 rounded-full hover:bg-indigo-600 hover:text-white transition-all flex-1">
                                            Publish
                                        </button>
                                    )}
                                    <button onClick={() => handleDelete(g.id)} className="text-rose-400 hover:text-rose-600 px-4 py-3 transition-colors text-xs uppercase tracking-widest">
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}