export type Template = {
    id: string
    name: string
    levels: string[]
    color: string
    description: string
}

export const templates: Template[] = [

    {
        id: "quiz",
        name: "Quiz",
        levels: ["SD", "SMP", "SMA", "UNIVERSITY"],
        color: "#6366F1",
        description: "Multiple choice quiz game"
    },

    {
        id: "truefalse",
        name: "True or False",
        levels: ["SD", "SMP", "SMA", "UNIVERSITY"],
        color: "#22C55E",
        description: "Answer true or false questions"
    },

    {
        id: "flashcard",
        name: "Flashcard",
        levels: ["SD", "SMP"],
        color: "#F59E0B",
        description: "Memorize concepts using flashcards"
    },

    {
        id: "matching",
        name: "Matching Pair",
        levels: ["SD", "SMP", "SMA", "UNIVERSITY"],
        color: "#06B6D4",
        description: "Match questions with answers"
    },

    {
        id: "wordsearch",
        name: "Word Search",
        levels: ["SD"],
        color: "#8B5CF6",
        description: "Find hidden words in the grid"
    },

    {
        id: "anagram",
        name: "Anagram",
        levels: ["SMA", "UNIVERSITY"],
        color: "#EF4444",
        description: "Rearrange letters into words"
    },

    {
        id: "shortanswer",
        name: "Short Answer",
        levels: ["SMA", "UNIVERSITY"],
        color: "#10B981",
        description: "Type the correct answer"
    },

    {
        id: "speedsort",
        name: "Speed Sort",
        levels: ["SMP", "SMA"],
        color: "#F97316",
        description: "Sort items as fast as possible"
    },

    {
        id: "wheel",
        name: "Wheel",
        levels: ["SD", "SMP"],
        color: "#EC4899",
        description: "Spin the wheel to pick questions"
    }

]