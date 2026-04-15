interface Player{
name:string
score:number
}

export default function RankingOverlay({players}:{players:Player[]}){

const sorted=[...players].sort((a,b)=>b.score-a.score)

return(

<div className="ranking-overlay">

<h3>Leaderboard</h3>

{sorted.map((p,i)=>(

<div key={i} className="rank-row">

<span>#{i+1}</span>

<span>{p.name}</span>

<span>{p.score}</span>

</div>

))}

</div>

)

}