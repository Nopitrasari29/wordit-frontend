import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function JoinGamePage() {

  const [code, setCode] = useState("")
  const navigate = useNavigate()

  function handleJoin() {

    if (!code) return

    navigate(`/play/${code}`)

  }

  return (

    <div className="container">

      <h1>Join Game</h1>

      <input
        placeholder="Enter Game Code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      <button onClick={handleJoin}>
        Join Game
      </button>

    </div>

  )

}