type PlayerScore = {
    player: string
    score: number
}

export const savePlayerScore = (
    gameCode: string,
    score: PlayerScore
) => {

    const sessions =
        JSON.parse(localStorage.getItem("wordit_sessions") || "{}")

    if (!sessions[gameCode]) {

        sessions[gameCode] = []

    }

    sessions[gameCode].push(score)

    localStorage.setItem(
        "wordit_sessions",
        JSON.stringify(sessions)
    )

}

export const getLeaderboard = (
    gameCode: string
): PlayerScore[] => {

    const sessions =
        JSON.parse(localStorage.getItem("wordit_sessions") || "{}")

    if (!sessions[gameCode]) return []

    return sessions[gameCode].sort(
        (a: PlayerScore, b: PlayerScore) =>
            b.score - a.score
    )

}