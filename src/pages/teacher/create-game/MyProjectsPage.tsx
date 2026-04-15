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

    if (loading) return <p className="text-gray-400 mt-10 text-center">Loading...</p>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">My Projects</h1>
                <Link to="/game/choose-level" className="bg-indigo-600 text-white px-4 py-2 rounded">+ Buat Game</Link>
            </div>
            {games.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                    <p>Belum ada game.</p>
                    <Link to="/game/choose-level" className="text-indigo-500 underline mt-2 block">Buat game pertama</Link>
                </div>
            ) : games.map(g => (
                <div key={g.id} className="bg-white p-4 rounded shadow flex justify-between items-start">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span>{templateIcons[g.templateType]}</span>
                            <h2 className="font-semibold text-lg">{g.title}</h2>
                        </div>
                        <p className="text-gray-500 text-sm">{g.templateType.replace(/_/g, " ")} · {g.educationLevel} · {g.difficulty}</p>
                        <div className="flex gap-2 items-center">
                            <span className={`text-xs px-2 py-0.5 rounded ${g.isPublished ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                                {g.isPublished ? "published" : "draft"}
                            </span>
                            {g.shareCode && <span className="font-mono text-xs text-indigo-500">Code: {g.shareCode}</span>}
                            <span className="text-xs text-gray-400">{g.playCount} plays</span>
                        </div>
                    </div>
                    <div className="flex gap-3 text-sm flex-shrink-0">
                        <Link to={`/game/edit?id=${g.id}`} className="text-blue-600">Edit</Link>
                        <Link to={`/game/preview?id=${g.id}`} className="text-green-600">Preview</Link>
                        {!g.isPublished && <button onClick={() => handlePublish(g.id)} className="text-purple-600">Publish</button>}
                        <button onClick={() => handleDelete(g.id)} className="text-red-500">Hapus</button>
                    </div>
                </div>
            ))}
        </div>
    )
}
