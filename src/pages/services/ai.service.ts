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

export const generateGameWithAI = async (
  payload: AIGeneratePayload,
): Promise<AIReponse> => {
  // Sekarang Anda bisa menggunakan instansi 'api' (Axios)
  // atau menggunakan 'API_URL' jika ingin menggunakan fetch manual.
  // Disarankan menggunakan 'api' agar interceptor token otomatis berjalan.
  const response = await api.post("/ai/generate-quiz", payload);

  return response.data.data;
};

// ✅ FE-18: Fungsi untuk mendapatkan feedback AI per soal yang salah
export const getFeedbackForQuestion = async (
  questionText: string,
  correctAnswer: string,
  studentAnswer?: string,
): Promise<string> => {
  const response = await api.post("/ai/get-feedback", {
    questionText,
    correctAnswer,
    studentAnswer,
  });
  return (
    response.data.data?.feedback ||
    "AI belum memberikan penjelasan untuk soal ini."
  );
}// ✅ AI-DOCS-UPLOAD: Ekstraksi teks dari file dokumen (PDF, Word, Image, Txt)
export const extractTextFromFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/ai/extract-text", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.data.text;
};
