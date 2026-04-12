import GameCard from "../../components/game/common/GameCard"

export default function DashboardStudentPage() {

    const games = [
        { id: "1", title: "Math Quiz", template: "Quiz", level: "SMP" },
        { id: "2", title: "English Flashcard", template: "Flashcard", level: "SD" }
    ]

    return (

        <div className="space-y-6">

            <h1 className="text-3xl font-bold">
                Student Dashboard
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