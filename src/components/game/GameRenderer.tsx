import AnagramEngine from "./engines/AnagramEngine"
import FlashcardEngine from "./engines/FlashcardEngine"
import HangmanEngine from "./engines/HangmanEngine"
import MazeChaseEngine from "./engines/MazeChaseEngine"
import SpinWheelEngine from "./engines/SpinWheelEngine"
import WordSearchEngine from "./engines/WordSearchEngine"

interface Props{
  templateType:string
  gameData:any
}

export default function GameRenderer({templateType,gameData}:Props){

  switch(templateType){

    case "ANAGRAM":
      return <AnagramEngine data={gameData} />

    case "FLASHCARD":
      return <FlashcardEngine data={gameData} />

    case "HANGMAN":
      return <HangmanEngine data={gameData} />

    case "MAZE_CHASE":
      return <MazeChaseEngine data={gameData} />

    case "SPIN_THE_WHEEL":
      return <SpinWheelEngine data={gameData} />

    case "WORD_SEARCH":
      return <WordSearchEngine data={gameData} />

    default:
      return <p>Unsupported template</p>

  }

}