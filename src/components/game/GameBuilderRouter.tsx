import { useSearchParams } from "react-router-dom"

import AnagramBuilder from "./builders/AnagramBuilder"
import FlashcardBuilder from "./builders/FlashcardBuilder"
import HangmanBuilder from "./builders/HangmanBuilder"
import MazeChaseBuilder from "./builders/MazeChaseBuilder"
import SpinWheelBuilder from "./builders/SpinWheelBuilder"
import WordSearchBuilder from "./builders/WordSearchBuilder"

export default function GameBuilderRouter() {

  const [params] = useSearchParams()

  const template = params.get("template")

  switch (template) {

    case "ANAGRAM":
      return <AnagramBuilder />

    case "FLASHCARD":
      return <FlashcardBuilder />

    case "HANGMAN":
      return <HangmanBuilder />

    case "MAZE_CHASE":
      return <MazeChaseBuilder />

    case "SPIN_THE_WHEEL":
      return <SpinWheelBuilder />

    case "WORD_SEARCH":
      return <WordSearchBuilder />

    default:
      return <div>No Template Selected</div>

  }

}