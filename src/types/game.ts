export type EducationLevel =
    | "SD"
    | "SMP"
    | "SMA"
    | "UNIVERSITY"

export type TemplateType =
    | "quiz"
    | "truefalse"
    | "flashcard"
    | "matching"
    | "anagram"
    | "shortanswer"
    | "speedsort"
    | "wordsearch"
    | "wheel"

export interface TemplateItem {

    id: TemplateType
    name: string
    description: string
    levels: EducationLevel[]

}