export type Score = {
    player: string
    gameId: string
    score: number
}

export const saveScore = (score: Score) => {

    const scores =
        JSON.parse(localStorage.getItem("wordit_scores") || "[]")

    scores.push(score)

    localStorage.setItem(
        "wordit_scores",
        JSON.stringify(scores)
    )

}

export const getScores = (): Score[] => {

    return JSON.parse(
        localStorage.getItem("wordit_scores") || "[]"
    )

}