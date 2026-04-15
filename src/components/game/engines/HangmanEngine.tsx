import { useState } from "react"

export default function HangmanEngine(){

const word="BIOLOGY"

const [guess,setGuess]=useState("")
const [used,setUsed]=useState<string[]>([])

function submit(){

setUsed([...used,guess])

}

return(

<div>

<h2>Hangman</h2>

<div>

{word.split("").map((l,i)=>

used.includes(l)?l:"_"

)}

</div>

<input
value={guess}
onChange={(e)=>setGuess(e.target.value.toUpperCase())}
/>

<button onClick={submit}>
Guess
</button>

</div>

)

}