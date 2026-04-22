// src/types/game.ts

export type Role = "STUDENT" | "TEACHER" | "ADMIN";

export enum TemplateType {
  ANAGRAM = "ANAGRAM",
  FLASHCARD = "FLASHCARD",
  HANGMAN = "HANGMAN",
  MAZE_CHASE = "MAZE_CHASE",
  SPIN_THE_WHEEL = "SPIN_THE_WHEEL",
  WORD_SEARCH = "WORD_SEARCH"
}

export enum EducationLevel {
  SD = "SD",
  SMP = "SMP",
  SMA = "SMA",
  UNIVERSITY = "UNIVERSITY"
}

export enum DifficultyLevel {
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD"
}

/**
 * 🎯 PENAMBAHAN: Interface untuk Konten Kuis (Isi gameJson)
 * Agar TypeScript tidak bingung saat kamu mengakses item.word atau item.front
 */

// Untuk ANAGRAM, HANGMAN, WORD_SEARCH
export interface QuizWordItem {
  word: string;
  hint: string;
}

// Untuk FLASHCARD
export interface QuizCardItem {
  front: string;
  back: string;
}

// Untuk MAZE_CHASE, SPIN_THE_WHEEL
export interface QuizQuestionItem {
  question: string;
  answer: string;
}

/**
 * Interface Utama Game
 */
export interface Game {
  id: string;
  title: string;
  description?: string;

  templateType: TemplateType;
  educationLevel: EducationLevel;
  difficulty: DifficultyLevel;

  // gameJson sekarang lebih terstruktur
  gameJson: {
    template: TemplateType;
    words?: QuizWordItem[];
    cards?: QuizCardItem[];
    questions?: QuizQuestionItem[];
  };

  creatorId: string;
  isPublished: boolean;
  playCount: number;
  shareCode?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GameSession {
  id: string;
  gameId: string;
  userId: string;
}

export interface Result {
  id: string;
  sessionId: string;
  scoreValue: number;
  maxScore: number;
  accuracy: number;
  timeSpent: number;
}

/* alias supaya tidak error di service */
export type GameResult = Result;