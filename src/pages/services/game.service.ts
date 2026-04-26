import api from "./api";
import type { Game, TemplateType, EducationLevel } from "../../types/game";

/**
 * 🎯 GET ALL GAMES (Explore)
 */
export const getGames = async (params?: {
  educationLevel?: EducationLevel;
  templateType?: TemplateType;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const res = await api.get("/games", { params });
  return res.data.data;
};

/**
 * 🎯 GET GAME DETAIL
 * Sinkron dengan response: { status: 'success', data: { ...game } }
 */
export const getGameById = async (id: string): Promise<Game> => {
  const res = await api.get(`/games/${id}`);
  return res.data.data || res.data;
};

/**
 * 🎯 GET GAME BY SHARE CODE
 */
export const getGameByCode = async (shareCode: string): Promise<Game> => {
  const res = await api.get(`/games/code/${shareCode}`);
  return res.data.data || res.data;
};

/**
 * 🎯 GET MY GAMES
 */
export const getMyGames = async (): Promise<Game[]> => {
  const res = await api.get("/games/user/my-games");
  return res.data.data;
};

/**
 * 🎯 CREATE GAME
 */
export const createGame = async (data: Partial<Game>) => {
  const res = await api.post("/games", data);
  return res.data.data;
};

/**
 * 🎯 UPDATE GAME
 */
export const updateGame = async (id: string, data: Partial<Game>) => {
  const res = await api.patch(`/games/${id}`, data);
  return res.data.data;
};

/**
 * 🎯 DELETE GAME
 */
export const deleteGame = async (id: string) => {
  const res = await api.delete(`/games/${id}`);
  return res.data.data;
};

/**
 * 🎯 PUBLISH GAME
 */
export const publishGame = async (id: string) => {
  const res = await api.patch(`/games/${id}/publish`);
  return res.data.data;
};

/**
 * 🎯 PLAY GAME (Start session)
 */
export const playGame = async (id: string) => {
  const res = await api.post(`/games/${id}/play`);
  return res.data.data;
};

/**
 * 🎯 SUBMIT ANSWER
 * Gunakan real Game ID (UUID), bukan share code
 */
export const submitAnswer = async (id: string, questionIndex: number, selectedAnswer: string, earnedPoints?: number) => {
  // Pastikan ID yang masuk ke sini adalah UUID kuis
  const res = await api.post(`/games/${id}/submit`, {
    questionIndex,
    selectedAnswer,
    earnedPoints
  });
  return res.data.data;
};

/**
 * 🎯 FINISH GAME
 */
export const finishGame = async (
  id: string,
  payload: {
    scoreValue: number;
    maxScore: number;
    accuracy: number;
    timeSpent: number;
    answersDetail: { word?: string; isCorrect: boolean; time?: number }[];
  }
) => {
  try {
    // 🎯 FIX: Gunakan ID UUID untuk hit endpoint backend
    const res = await api.post(`/games/${id}/finish`, payload);
    return res.data.data;
  } catch (err: any) {
    console.error("⚠️ Gagal simpan skor ke DB:", err?.response?.data || err.message);
    throw err; // Lempar error agar ditangkap catch di handler
  }
};