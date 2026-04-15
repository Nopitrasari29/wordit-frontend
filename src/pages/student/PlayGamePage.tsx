import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

import GameRenderer from "../../components/game/GameRenderer"

interface Game {
  id: string
  title: string
  templateType: string
  gameJson: any
}

export default function PlayGamePage() {

  const { gameId } = useParams()

  const [game,setGame] = useState<Game | null>(null)

  useEffect(()=>{

    fetch(`http://localhost:3000/api/games/${gameId}`)
      .then(res=>res.json())
      .then(data=>setGame(data))
      .catch(()=>{

        // fallback demo
        setGame({
          id:"demo",
          title:"Animal Anagram",
          templateType:"ANAGRAM",
          gameJson:{}
        })

      })

  },[gameId])

  if(!game) return <p>Loading game...</p>

  return(

    <div className="container">

      <h1>{game.title}</h1>

      <GameRenderer
        templateType={game.templateType}
        gameData={game.gameJson}
      />

    </div>

  )

}