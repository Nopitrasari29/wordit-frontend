import { useState } from "react"

export default function SpinWheelEngine(){

const items=["Question 1","Question 2","Question 3"]

const [result,setResult]=useState("")

function spin(){

const r=items[Math.floor(Math.random()*items.length)]

setResult(r)

}

return(

<div>

<h2>Spin the Wheel</h2>

<button onClick={spin}>
Spin
</button>

<p>{result}</p>

</div>

)

}