// Impor api sebagai default dan API_URL sebagai named export
import api from "./api";
import type { TemplateType, EducationLevel } from "../../types/game";

export type AIGeneratePayload = {
    topic: string;
    templateType: TemplateType;
    educationLevel: EducationLevel;
    count?: number;
};

export interface AIReponse {
    template: TemplateType;
    words?: { word: string; hint: string }[];
    cards?: { front: string; back: string }[];
    questions?: { question: string; answer: string }[];
}

export const generateGameWithAI = async (payload: AIGeneratePayload): Promise<AIReponse> => {
    // Sekarang Anda bisa menggunakan instansi 'api' (Axios) 
    // atau menggunakan 'API_URL' jika ingin menggunakan fetch manual.
    // Disarankan menggunakan 'api' agar interceptor token otomatis berjalan.
    const response = await api.post("/ai/generate-quiz", payload);
    
    return response.data.data;
};