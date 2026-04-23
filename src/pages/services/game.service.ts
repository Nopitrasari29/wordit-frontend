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
 * 🎯 GET GAME DETAIL (Dipakai di EditGamePage)
 * FIX: Nama diubah dari getGame -> getGameById agar sesuai dengan EditGamePage
 */
export const getGameById = async (id: string): Promise<Game> => {
  const res = await api.get(`/games/${id}`);
  return res.data.data;
};

/**
 * 🎯 GET GAME BY SHARE CODE (Untuk Student Join)
 */
export const getGameByCode = async (shareCode: string): Promise<Game> => {
  const res = await api.get(`/games/code/${shareCode}`);
  return res.data.data;
};

/**
 * 🎯 GET MY GAMES (Teacher Dashboard)
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
 * 🎯 SUBMIT ANSWER (Real-time: Update Redis + Socket saja, tidak simpan ke DB)
 */
export const submitAnswer = async (id: string, questionIndex: number, selectedAnswer: string, earnedPoints?: number) => {
  const res = await api.post(`/games/${id}/submit`, {
    questionIndex,
    selectedAnswer,
    earnedPoints
  });
  return res.data.data;
};

/**
 * 🎯 FINISH GAME (Simpan SKOR FINAL ke PostgreSQL - dipanggil 1x saat game selesai!)
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
    const res = await api.post(`/games/${id}/finish`, payload);
    console.log("✅ Skor berhasil disimpan ke database:", res.data);
    return res.data.data;
  } catch (err) {
    // Jangan crash halaman result meskipun save gagal
    console.error("⚠️ Gagal simpan skor ke DB (non-fatal):", err);
    return null;
  }
};
