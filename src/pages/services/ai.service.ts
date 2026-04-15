import { API_URL } from "./api"
import type { TemplateType, EducationLevel } from "../../types/game"

export type AIGeneratePayload = {
    topic: string
    templateType: TemplateType
    educationLevel: EducationLevel
    count?: number
}

export async function generateGameWithAI(payload: AIGeneratePayload, token: string): Promise<{ gameJson: any }> {
    const res = await fetch(`${API_URL}/ai/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.message || "Failed to generate with AI")
    return json.data
}