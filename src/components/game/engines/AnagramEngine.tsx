import { useState } from "react"
import RankingOverlay from "../common/RankingOverlay"

export default function AnagramEngine({data}:any){

const word="PLANET"

const shuffled=word.split("").sort(()=>Math.random()-0.5)

const [answer,setAnswer]=useState("")
const [score,setScore]=useState(0)

function submit(){

if(answer.toUpperCase()===word){
setScore(score+10)
alert("Correct!")
}else{
alert("Wrong")
}

}

return(

<div>

<h2>Arrange the letters</h2>

<div style={{fontSize:30}}>
{shuffled.join(" ")}
</div>

<input
value={answer}
onChange={(e)=>setAnswer(e.target.value)}
/>

<button onClick={submit}>
Submit
</button>

<RankingOverlay
players={[
{name:"Andi",score:100},
{name:"Budi",score:80},
{name:"You",score:score}
]}
/>

</div>

)

}