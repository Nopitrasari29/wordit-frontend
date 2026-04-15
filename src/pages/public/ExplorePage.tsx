import { useEffect, useState } from "react"
import { getGames } from "../services/game.service"
import { dummyGames } from "../../data/dummyGames"

export default function ExplorePage() {

  const [games, setGames] = useState<any[]>([])
  const [level, setLevel] = useState<string>("ALL")
  const [loading, setLoading] = useState(true)

  async function loadGames(levelFilter?: string) {
    try {

      const params: any = {}

      if (levelFilter && levelFilter !== "ALL") {
        params.educationLevel = levelFilter
      }

      const data = await getGames(params)

      if (data && data.length > 0) {
        setGames(data)
      } else {
        // fallback dummy
        if (levelFilter && levelFilter !== "ALL") {
          setGames(dummyGames.filter(g => g.educationLevel === levelFilter))
        } else {
          setGames(dummyGames)
        }
      }

    } catch (err) {

      console.log("Backend kosong, pakai dummy")

      if (levelFilter && levelFilter !== "ALL") {
        setGames(dummyGames.filter(g => g.educationLevel === levelFilter))
      } else {
        setGames(dummyGames)
      }

    }

    setLoading(false)
  }

  useEffect(() => {
    loadGames()
  }, [])

  function filterLevel(lvl: string) {
    setLevel(lvl)
    loadGames(lvl)
  }

  if (loading) return <p className="text-center mt-10">Loading games...</p>

  return (
    <div className="space-y-8">

      <h1 className="text-3xl font-bold">Explore Games</h1>

      {/* FILTER */}
      <div className="flex gap-3">
        {["SD","SMP","SMA","UNIVERSITY","ALL"].map(lvl => (
          <button
            key={lvl}
            onClick={() => filterLevel(lvl)}
            className={`px-4 py-2 rounded border ${
              level === lvl ? "bg-indigo-600 text-white" : ""
            }`}
          >
            {lvl}
          </button>
        ))}
      </div>

      {/* GAME LIST */}
      <div className="grid grid-cols-3 gap-6">

        {games.map(game => (

          <div
            key={game.id}
            className="bg-white p-4 rounded shadow hover:shadow-lg transition"
          >
            <h2 className="font-semibold text-lg">
              {game.title}
            </h2>

            <p className="text-gray-500 text-sm">
              {game.templateType.replace("_"," ")}
            </p>

            <p className="text-xs text-gray-400">
              {game.educationLevel} • {game.difficulty}
            </p>

            <p className="text-xs text-gray-400 mt-2">
              {game.playCount || 0} plays
            </p>

          </div>

        ))}

      </div>

    </div>
  )
}