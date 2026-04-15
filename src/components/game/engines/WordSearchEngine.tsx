export default function WordSearchEngine(){

const words=["CAT","DOG","FISH"]

return(

<div>

<h2>Find the Words</h2>

<ul>

{words.map(w=>(
<li key={w}>{w}</li>
))}

</ul>

</div>

)

}