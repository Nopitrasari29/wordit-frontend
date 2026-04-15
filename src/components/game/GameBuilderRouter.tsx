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

  const BuilderWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="page-enter animate-fade-in">
      {children}
    </div>
  );

  switch (template) {
    case "ANAGRAM":
      return <BuilderWrapper><AnagramBuilder /></BuilderWrapper>

    case "FLASHCARD":
      return <BuilderWrapper><FlashcardBuilder /></BuilderWrapper>

    case "HANGMAN":
      return <BuilderWrapper><HangmanBuilder /></BuilderWrapper>

    case "MAZE_CHASE":
      return <BuilderWrapper><MazeChaseBuilder /></BuilderWrapper>

    case "SPIN_THE_WHEEL":
      return <BuilderWrapper><SpinWheelBuilder /></BuilderWrapper>

    case "WORD_SEARCH":
      return <BuilderWrapper><WordSearchBuilder /></BuilderWrapper>

    default:
      return (
        <div className="bg-white p-12 rounded-[2.5rem] border-4 border-dashed border-slate-100 text-center">
          <div className="text-6xl mb-4 opacity-30">🔍</div>
          <h2 className="text-2xl font-black text-slate-300">No Template Selected</h2>
          <p className="text-slate-400 font-bold mt-2">Silakan pilih template terlebih dahulu.</p>
        </div>
      )
  }
}