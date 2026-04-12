export type Game = {
    id?: string
    title: string
    template: string
    level: string
    questions: any[]
}

export const generateGameCode = () => {

    return Math.random()
        .toString(36)
        .substring(2, 7)
        .toUpperCase()

}

export const saveDraftGame = (game: Game) => {

    const games =
        JSON.parse(localStorage.getItem("wordit_games") || "[]")

    const newGame = {

        ...game,
        id: crypto.randomUUID(),
        status: "draft",
        createdAt: new Date().toISOString()

    }

    games.push(newGame)

    localStorage.setItem(
        "wordit_games",
        JSON.stringify(games)
    )

}

export const publishGame = (game: Game) => {

    const games =
        JSON.parse(localStorage.getItem("wordit_games") || "[]")

    const newGame = {

        ...game,
        id: crypto.randomUUID(),
        status: "published",
        gameCode: generateGameCode(),
        createdAt: new Date().toISOString()

    }

    games.push(newGame)

    localStorage.setItem(
        "wordit_games",
        JSON.stringify(games)
    )

    return newGame

}