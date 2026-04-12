export type GameResult = {
    player: string
    gameId: string
    score: number
    accuracy: number
    createdAt: string
}

export const saveResult = (result: GameResult) => {

    const results =
        JSON.parse(localStorage.getItem("wordit_results") || "[]")

    results.push(result)

    localStorage.setItem(
        "wordit_results",
        JSON.stringify(results)
    )

}

export const getResults = () => {

    return JSON.parse(
        localStorage.getItem("wordit_results") || "[]"
    )

}