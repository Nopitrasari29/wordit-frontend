import api from "../pages/services/api"

export async function startSession(gameId: string) {

    const res = await api.post("/sessions/start", {
        gameId
    })

    return res.data.data

}

export async function finishSession(sessionId: string, result: any) {

    const res = await api.post("/results", {

        sessionId,
        ...result

    })

    return res.data.data

}