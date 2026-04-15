export type Role =
    | "STUDENT"
    | "TEACHER"
    | "ADMIN"

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

export interface Game {

    id: string
    title: string
    description?: string

    templateType: TemplateType
    educationLevel: EducationLevel
    difficulty: DifficultyLevel

    gameJson: any

    creatorId: string

    isPublished: boolean
    playCount: number

    shareCode?: string

}

export interface GameSession {

    id: string
    gameId: string
    userId: string

}

export interface Result {

    id: string
    sessionId: string

    scoreValue: number
    maxScore: number

    accuracy: number
    timeSpent: number

}

/* alias supaya tidak error di service */

export type GameResult = Result