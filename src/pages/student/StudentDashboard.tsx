import { useEffect, useState } from "react"
import { getGames } from "../services/game.service"
import { dummyGames } from "../../data/dummyGames"

export default function StudentDashboard() {

  const [games, setGames] = useState<any[]>([])

  useEffect(() => {

    async function load() {

      try {

        const data = await getGames()

        if (data && data.length > 0) {
          setGames(data.slice(0,3))
        } else {
          setGames(dummyGames.slice(0,3))
        }

      } catch {

        setGames(dummyGames.slice(0,3))

      }

    }

    load()

  }, [])

  return (

    <div className="space-y-10">

      <h1 className="text-3xl font-bold">
        Student Dashboard
      </h1>

      {/* Recommended Games */}

      <div>

        <h2 className="text-xl font-semibold mb-4">
          Recommended Games
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

            </div>

          ))}

        </div>

      </div>

      {/* Leaderboard */}

      <div>

        <h2 className="text-xl font-semibold mb-4">
          Leaderboard
        </h2>

        <table className="w-full text-left">

          <thead>

            <tr className="border-b">

              <th>Rank</th>
              <th>Name</th>
              <th>Score</th>

            </tr>

          </thead>

          <tbody>

            <tr>
              <td>1</td>
              <td>Andi</td>
              <td>120</td>
            </tr>

            <tr>
              <td>2</td>
              <td>Budi</td>
              <td>100</td>
            </tr>

            <tr>
              <td>3</td>
              <td>Siti</td>
              <td>90</td>
            </tr>

          </tbody>

        </table>

      </div>

    </div>
  )
}