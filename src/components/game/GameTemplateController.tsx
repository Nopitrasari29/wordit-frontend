import QuizEngine from "./engines/QuizEngine"
import TrueOrFalseEngine from "./engines/TrueOrFalseEngine"
import FlashcardEngine from "./engines/FlashcardEngine"
import MatchingPairEngine from "./engines/MatchingPairEngine"
import WordSearchEngine from "./engines/WordSearchEngine"
import AnagramEngine from "./engines/AnagramEngine"
import ShortAnswerEngine from "./engines/ShortAnswerEngine"
import SpeedSortEngine from "./engines/SpeedSortEngine"
import WheelEngine from "./engines/WheelEngine"

type Props = {
    template: string
}

export default function GameTemplateController({ template }: Props) {

    switch (template) {

        case "quiz":
            return <QuizEngine />

        case "truefalse":
            return <TrueOrFalseEngine />

        case "flashcard":
            return <FlashcardEngine />

        case "matching":
            return <MatchingPairEngine />

        case "wordsearch":
            return <WordSearchEngine />

        case "anagram":
            return <AnagramEngine />

        case "shortanswer":
            return <ShortAnswerEngine />

        case "speedsort":
            return <SpeedSortEngine />

        case "wheel":
            return <WheelEngine />

        default:
            return <div>Template Not Found</div>

    }

}