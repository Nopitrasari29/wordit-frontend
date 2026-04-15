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

        return <p>Loading...</p>

    }

    async function save() {

        await updateGame(id!, {

            gameJson: game.gameJson

        })

        alert("saved")

    }

    return (

        <div>

            <h1>Edit Game</h1>

            <GameBuilderRouter
                templateType={game.templateType}
                value={game.gameJson}
                onChange={(json: any) => setGame({ ...game, gameJson: json })}
            />

            <button onClick={save}>Save</button>

        </div>

    )

}