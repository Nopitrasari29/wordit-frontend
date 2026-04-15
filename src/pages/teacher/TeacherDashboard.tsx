import { useEffect, useState } from "react"
import { getMyGames } from "../services/game.service"
import { dummyTeacherGames } from "../../data/dummyTeacherGames"

import AnalyticsClassPage from "./analytics/AnalyticsClassPage"

export default function TeacherDashboard() {

  const [games, setGames] = useState<any[]>([])

  useEffect(() => {

    async function loadGames() {

      try {

        const data = await getMyGames()

        if (data && data.length > 0) {
          setGames(data)
        } else {
          setGames(dummyTeacherGames)
        }

      } catch {
        setGames(dummyTeacherGames)
      }

    }

    loadGames()

  }, [])

  const totalPlays = games.reduce((a, g) => a + (g.playCount || 0), 0)

  const publishedGames = games.filter(g => g.isPublished).length

  return (

    <div className="space-y-10">

      <h1 className="text-3xl font-bold">
        Teacher Dashboard
      </h1>

      {/* ================= STATS ================= */}

      <div className="grid grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded shadow">

          <p className="text-gray-500 text-sm">
            Games Created
          </p>

          <h2 className="text-2xl font-bold">
            {games.length}
          </h2>

        </div>

        <div className="bg-white p-6 rounded shadow">

          <p className="text-gray-500 text-sm">
            Total Plays
          </p>

          <h2 className="text-2xl font-bold">
            {totalPlays}
          </h2>

        </div>

        <div className="bg-white p-6 rounded shadow">

          <p className="text-gray-500 text-sm">
            Published Games
          </p>

          <h2 className="text-2xl font-bold">
            {publishedGames}
          </h2>

        </div>

      </div>

      {/* ================= CLASS ANALYTICS ================= */}

      <AnalyticsClassPage games={games} />

      {/* ================= MY GAMES ================= */}

      <div>

        <h2 className="text-xl font-semibold mb-4">
          My Games
        </h2>

        <div className="grid grid-cols-3 gap-6">

          {games.map(game => (

            <div
              key={game.id}
              className="bg-white p-4 rounded shadow"
            >

              <h3 className="font-semibold">
                {game.title}
              </h3>

              <p className="text-sm text-gray-500">
                {game.templateType}
              </p>

              <p className="text-xs text-gray-400">
                {game.educationLevel}
              </p>

              <p className="text-xs text-gray-400 mt-2">
                {game.playCount} plays
              </p>

            </div>

          ))}

        </div>

      </div>

    </div>

  )

}