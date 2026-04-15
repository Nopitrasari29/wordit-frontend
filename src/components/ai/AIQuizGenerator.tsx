import { useState } from "react"

export default function AIQuizGenerator(){

const [topic,setTopic]=useState("")
const [questions,setQuestions]=useState<any[]>([])

async function generate(){

const res=await fetch("/api/ai/generate",{method:"POST"})

const data=await res.json()

setQuestions(data)

}

return(

<div>

<h2>AI Quiz Generator</h2>

<input
placeholder="Topic"
value={topic}
onChange={(e)=>setTopic(e.target.value)}
/>

<button onClick={generate}>
Generate Questions
</button>

<ul>

{questions.map((q,i)=>(
<li key={i}>{q.question}</li>
))}

</ul>

</div>

)

}