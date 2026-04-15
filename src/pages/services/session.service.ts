import { API_URL } from "./api"
import type { GameSession, GameResult, DifficultyLevel } from "../../types/game"

export async function startSession(gameId: string, token: string): Promise<GameSession> {
    const res = await fetch(`${API_URL}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ gameId }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.message || "Failed to start session")
    return json.data
}

export type SubmitResultPayload = {
    scoreValue: number
    maxScore: number
    accuracy: number
    timeSpent: number
    difficultyPlayed: DifficultyLevel
    answersDetail: any[]
    aiGradingResult?: any
}

export async function submitResult(sessionId: string, payload: SubmitResultPayload, token: string): Promise<GameResult> {
    const res = await fetch(`${API_URL}/sessions/${sessionId}/result`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.message || "Failed to submit result")
    return json.data
}

export async function getSessionResult(sessionId: string, token: string): Promise<GameResult> {
    const res = await fetch(`${API_URL}/sessions/${sessionId}/result`, {
        headers: { Authorization: `Bearer ${token}` },
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.message || "Failed to fetch result")
    return json.data
}

export async function getGameLeaderboard(gameId: string, token?: string): Promise<{ user: { name: string }; result: { scoreValue: number } }[]> {
    const headers: Record<string, string> = {}
    if (token) headers.Authorization = `Bearer ${token}`
    const res = await fetch(`${API_URL}/games/${gameId}/leaderboard`, { headers })
    const json = await res.json()
    if (!res.ok) throw new Error(json.message || "Failed to fetch leaderboard")
    return json.data
}

export async function getMySessions(token: string): Promise<GameSession[]> {
    const res = await fetch(`${API_URL}/sessions/my`, { headers: { Authorization: `Bearer ${token}` } })
    const json = await res.json()
    if (!res.ok) throw new Error(json.message || "Failed to fetch sessions")
    return json.data
}