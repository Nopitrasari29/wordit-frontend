import GameCard from "./common/GameCard"

const dummyGames = [
  {
    id: "1",
    title: "Animal Anagram",
    templateType: "ANAGRAM",
    educationLevel: "SD",
  },
  {
    id: "2",
    title: "Physics Flashcard",
    templateType: "FLASHCARD",
    educationLevel: "SMA",
  },
  {
    id: "3",
    title: "Word Search Geography",
    templateType: "WORD_SEARCH",
    educationLevel: "SMP",
  },
]

export default function ExploreGamesPage() {

  return (

    <div className="grid md:grid-cols-3 gap-6">

      {dummyGames.map((game) => (

        <GameCard
          key={game.id}
          id={game.id}
          title={game.title}
          templateType={game.templateType}
          educationLevel={game.educationLevel}
        />

      ))}

    </div>

  )

}