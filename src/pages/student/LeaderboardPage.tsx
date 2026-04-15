import { useEffect, useState } from "react"

import { getGames } from "../services/game.service"

export default function LeaderboardPage() {

    const [games, setGames] = useState([])

    useEffect(() => {

        async function load() {

            const data = await getGames()

            setGames(data)

        }

        load()

    }, [])

    return (

        <div>

            <h1>Leaderboard</h1>

            <table>

                <thead>

                    <tr>
                        <th>Game</th>
                        <th>Plays</th>
                    </tr>

                </thead>

                <tbody>

                    {games.map((g: any) => (

                        <tr key={g.id}>

                            <td>{g.title}</td>

                            <td>{g.playCount}</td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>

    )
}