import AnagramEngine from "./engines/AnagramEngine"
import FlashcardEngine from "./engines/FlashcardEngine"
import HangmanEngine from "./engines/HangmanEngine"
import MazeChaseEngine from "./engines/MazeChaseEngine"
import SpinWheelEngine from "./engines/SpinWheelEngine"
import WordSearchEngine from "./engines/WordSearchEngine"

interface Props {
  templateType: string
  gameData: any
}

export default function GameRenderer({ templateType, gameData }: Props) {
  // Komponen pembungkus agar semua engine game memiliki frame yang cantik
  const EngineWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="w-full h-full min-h-[500px] flex items-center justify-center p-4 bg-white/50 backdrop-blur-sm rounded-[2.5rem]">
      {children}
    </div>
  );

  switch (templateType) {
    case "ANAGRAM":
      return <EngineWrapper><AnagramEngine data={gameData} /></EngineWrapper>

    case "FLASHCARD":
      return <EngineWrapper><FlashcardEngine data={gameData} /></EngineWrapper>

    case "HANGMAN":
      return <EngineWrapper><HangmanEngine data={gameData} /></EngineWrapper>

    case "MAZE_CHASE":
      return <EngineWrapper><MazeChaseEngine data={gameData} /></EngineWrapper>

    case "SPIN_THE_WHEEL":
      return <EngineWrapper><SpinWheelEngine data={gameData} /></EngineWrapper>

    case "WORD_SEARCH":
      return <EngineWrapper><WordSearchEngine data={gameData} /></EngineWrapper>

    default:
      return (
        <div className="text-center p-20 bg-white rounded-[2rem] shadow-sm border border-slate-100">
          <p className="text-slate-400 font-black text-xl italic">Unsupported template</p>
        </div>
      )
  }
}