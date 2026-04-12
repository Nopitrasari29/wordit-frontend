import { useSearchParams } from "react-router-dom"

import QuizBuilder from "../../../components/game/builders/QuizBuilder"
import TrueOrFalseBuilder from "../../../components/game/builders/TrueOrFalseBuilder"
import FlashcardBuilder from "../../../components/game/builders/FlashcardBuilder"
import MatchingPairBuilder from "../../../components/game/builders/MatchingPairBuilder"
import WordSearchBuilder from "../../../components/game/builders/WordSearchBuilder"
import AnagramBuilder from "../../../components/game/builders/AnagramBuilder"
import ShortAnswerBuilder from "../../../components/game/builders/ShortAnswerBuilder"
import SpeedSortBuilder from "../../../components/game/builders/SpeedSortBuilder"
import WheelBuilder from "../../../components/game/builders/WheelBuilder"

export default function GameBuilderPage() {

    const [params] = useSearchParams()

    const template = params.get("template")

    function renderBuilder() {

        switch (template) {

            case "quiz":
                return <QuizBuilder />

            case "truefalse":
                return <TrueOrFalseBuilder />

            case "flashcard":
                return <FlashcardBuilder />

            case "matching":
                return <MatchingPairBuilder />

            case "wordsearch":
                return <WordSearchBuilder />

            case "anagram":
                return <AnagramBuilder />

            case "shortanswer":
                return <ShortAnswerBuilder />

            case "speedsort":
                return <SpeedSortBuilder />

            case "wheel":
                return <WheelBuilder />

            default:
                return (

                    <div className="text-center mt-10 text-gray-500">

                        No Builder Selected

                    </div>

                )

        }

    }

    return (

        <div className="space-y-6">

            <h1 className="text-3xl font-bold">
                Game Builder
            </h1>

            {renderBuilder()}

        </div>

    )

}