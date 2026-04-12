import { useState } from "react"
import QuestionForm from "../../../components/game/forms/QuestionForm"
import QuestionList from "../../../components/game/forms/QuestionList"
import GameCreatorWizard from "../../../components/game/GameCreatorWizard"

type Question = {
    question: string
    answers?: string[]
    answer?: string
}

export default function AddQuestionsPage() {

    const [questions, setQuestions] = useState<Question[]>([])

    const addQuestion = (q: Question) => {

        setQuestions([...questions, q])

    }

    return (

        <div className="space-y-6">

            <GameCreatorWizard step={3} />

            <QuestionForm
                template="quiz"
                onAdd={addQuestion}
            />

            <QuestionList
                questions={questions}
            />

        </div>

    )

}