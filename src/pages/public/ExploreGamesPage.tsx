import GameCard from "../../components/game/common/GameCard"

type Game = {
    id: string
    title: string
    template: string
    level: string
}

export default function ExploreGamesPage() {

    const games: Game[] = [

        { id: "1", title: "Math Quiz", template: "Quiz", level: "SMP" },
        { id: "2", title: "Science TrueFalse", template: "True or False", level: "SMA" },
        { id: "3", title: "English Flashcard", template: "Flashcard", level: "SD" },
        { id: "4", title: "History Matching", template: "Matching Pair", level: "SMP" },
        { id: "5", title: "Animal Word Search", template: "Word Search", level: "SD" },
        { id: "6", title: "Chemistry Anagram", template: "Anagram", level: "SMA" },
        { id: "7", title: "Physics Short Answer", template: "Short Answer", level: "UNIVERSITY" },
        { id: "8", title: "Sorting Game", template: "Speed Sort", level: "SMP" },
        { id: "9", title: "Random Wheel", template: "Wheel", level: "SD" }

    ]

    return (

        <div className="space-y-6">

            <h1 className="text-3xl font-bold">
                Explore Games
            </h1>

            <div className="grid md:grid-cols-3 gap-6">

                {games.map(game => (

                    <GameCard
                        key={game.id}
                        id={game.id}
                        title={game.title}
                        template={game.template}
                        level={game.level}
                    />

                ))}

            </div>

        </div>

    )

}