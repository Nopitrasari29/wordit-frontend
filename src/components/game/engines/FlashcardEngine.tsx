import { useState } from "react"

export default function FlashcardEngine(){

const cards=[
{q:"Capital of France",a:"Paris"},
{q:"2+2",a:"4"}
]

const [index,setIndex]=useState(0)
const [show,setShow]=useState(false)

const card=cards[index]

return(

<div>

<h2>Flashcard</h2>

<div className="card">

<h3>{show?card.a:card.q}</h3>

</div>

<button onClick={()=>setShow(!show)}>
Flip
</button>

<button onClick={()=>setIndex((index+1)%cards.length)}>
Next
</button>

</div>

)

}