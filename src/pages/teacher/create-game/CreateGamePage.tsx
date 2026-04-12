import { useSearchParams } from "react-router-dom"
import GameCreatorWizard from "../../../components/game/GameCreatorWizard"

import QuizBuilder from "../../../components/game/builders/QuizBuilder"
import TrueFalseBuilder from "../../../components/game/builders/TrueOrFalseBuilder"
import FlashcardBuilder from "../../../components/game/builders/FlashcardBuilder"
import MatchingBuilder from "../../../components/game/builders/MatchingPairBuilder"
import WordSearchBuilder from "../../../components/game/builders/WordSearchBuilder"
import AnagramBuilder from "../../../components/game/builders/AnagramBuilder"
import ShortAnswerBuilder from "../../../components/game/builders/ShortAnswerBuilder"
import SpeedSortBuilder from "../../../components/game/builders/SpeedSortBuilder"
import WheelBuilder from "../../../components/game/builders/WheelBuilder"

export default function CreateGamePage() {

    const [params] = useSearchParams()
    const template = params.get("template")

    function renderBuilder() {

        switch (template) {

            case "quiz": return <QuizBuilder />
            case "truefalse": return <TrueFalseBuilder />
            case "flashcard": return <FlashcardBuilder />
            case "matching": return <MatchingBuilder />
            case "wordsearch": return <WordSearchBuilder />
            case "anagram": return <AnagramBuilder />
            case "shortanswer": return <ShortAnswerBuilder />
            case "speedsort": return <SpeedSortBuilder />
            case "wheel": return <WheelBuilder />

            default: return <div>Select template</div>

        }

    }

    return (

        <div className="space-y-6">

            <GameCreatorWizard step={2} />

            <h1 className="text-3xl font-bold">
                Create Game
            </h1>

            {renderBuilder()}

        </div>

    )

}