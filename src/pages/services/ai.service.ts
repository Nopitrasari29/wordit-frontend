// sementara mock

export type AIQuestion = {
    question: string
    answers: string[]
    correct: number
}

export const generateQuestions = async (
    topic: string
): Promise<AIQuestion[]> => {

    const questions: AIQuestion[] = [

        {
            question: `What is ${topic}?`,
            answers: [
                "Option A",
                "Option B",
                "Option C",
                "Option D"
            ],
            correct: 0
        },

        {
            question: `Example of ${topic}?`,
            answers: [
                "Example A",
                "Example B",
                "Example C",
                "Example D"
            ],
            correct: 1
        }

    ]

    return questions

}