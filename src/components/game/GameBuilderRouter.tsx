import { useSearchParams } from "react-router-dom";
import AnagramBuilder from "./builders/AnagramBuilder";
import FlashcardBuilder from "./builders/FlashcardBuilder";
import HangmanBuilder from "./builders/HangmanBuilder";
import MazeChaseBuilder from "./builders/MazeChaseBuilder";
import SpinWheelBuilder from "./builders/SpinWheelBuilder";
import WordSearchBuilder from "./builders/WordSearchBuilder";

// ═══════════════ IMPORT NEW STANDARD ASSESSMENTS ═══════════════
import MultipleChoiceBuilder from "./builders/MultipleChoiceBuilder";
import TrueFalseBuilder from "./builders/TrueFalseBuilder";
import MatchingBuilder from "./builders/MatchingBuilder";
import EssayBuilder from "./builders/EssayBuilder";

// 💡 TIPS: Jika editor masih merah (Cannot find module), coba tekan Ctrl+Shift+P > Restart TS Server.

/**
 * 🎯 FIX UTAMA: Pindahkan BuilderWrapper ke LUAR fungsi GameBuilderRouter.
 * Ini mencegah React menghancurkan dan membuat ulang (remounting) editor 
 * setiap kali kamu mengetik satu huruf, sehingga UI tidak akan "ngedip" 
 * dan posisi scroll tetap stabil.
 */
const BuilderWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="animate-fade-in transition-all duration-500">
    {children}
  </div>
);

interface GameBuilderRouterProps {
  value: any;
  onChange: (data: any) => void;
  templateType?: string;
  initialQuestions?: any[];
}

export default function GameBuilderRouter({
  value,
  onChange,
  templateType,
  initialQuestions
}: GameBuilderRouterProps) {
  const [params] = useSearchParams();

  /**
   * PENENTUAN TEMPLATE AKTIF:
   * Mengambil template dari URL, prop database, atau deteksi manual dari value.
   */
  const activeTemplate = (
    params.get("template") ||
    templateType ||
    value?.template ||
    ""
  ).toUpperCase();

  // Jika sedang memuat data awal, jangan render apapun dulu
  if (!activeTemplate && !value) {
    return null;
  }

  /**
   * 🚀 ROUTING EDITOR:
   * Mengarahkan ke builder yang sesuai berdasarkan tipe template.
   */
  switch (activeTemplate) {
    case "ANAGRAM":
      return (
        <BuilderWrapper>
          <AnagramBuilder
            value={value}
            onChange={onChange}
            initialData={initialQuestions}
          />
        </BuilderWrapper>
      );

    case "FLASHCARD":
      return (
        <BuilderWrapper>
          <FlashcardBuilder
            value={value}
            onChange={onChange}
            initialData={initialQuestions}
          />
        </BuilderWrapper>
      );

    case "HANGMAN":
      return (
        <BuilderWrapper>
          <HangmanBuilder
            value={value}
            onChange={onChange}
            initialData={initialQuestions}
          />
        </BuilderWrapper>
      );

    case "MAZE_CHASE":
      return (
        <BuilderWrapper>
          <MazeChaseBuilder
            value={value}
            onChange={onChange}
            initialData={initialQuestions}
          />
        </BuilderWrapper>
      );

    case "SPIN_THE_WHEEL":
    case "SPIN_WHEEL":
      return (
        <BuilderWrapper>
          <SpinWheelBuilder
            value={value}
            onChange={onChange}
            initialData={initialQuestions}
          />
        </BuilderWrapper>
      );

    case "WORD_SEARCH":
      return (
        <BuilderWrapper>
          <WordSearchBuilder
            value={value}
            onChange={onChange}
            initialData={initialQuestions}
          />
        </BuilderWrapper>
      );

    // ═══════════════ NEW STANDARD ASSESSMENTS ROUTING ═══════════════
    case "MULTIPLE_CHOICE":
      return (
        <BuilderWrapper>
          <MultipleChoiceBuilder
            value={value}
            onChange={onChange}
            initialData={initialQuestions}
          />
        </BuilderWrapper>
      );

    case "TRUE_FALSE":
      return (
        <BuilderWrapper>
          <TrueFalseBuilder
            value={value}
            onChange={onChange}
            initialData={initialQuestions}
          />
        </BuilderWrapper>
      );

    case "MATCHING":
      return (
        <BuilderWrapper>
          <MatchingBuilder
            value={value}
            onChange={onChange}
            initialData={initialQuestions}
          />
        </BuilderWrapper>
      );

    case "ESSAY":
      return (
        <BuilderWrapper>
          <EssayBuilder
            value={value}
            onChange={onChange}
            initialData={initialQuestions}
          />
        </BuilderWrapper>
      );

    // Default jika template kuis tidak dikenali
    default:
      return (
        <div className="bg-slate-50 p-20 rounded-[3.5rem] border-4 border-dashed border-slate-200 text-center flex flex-col items-center justify-center">
          <div className="text-7xl mb-6 grayscale opacity-30">🧩</div>
          <h2 className="text-2xl font-black text-slate-400 uppercase tracking-tighter">
            Template Not Detected
          </h2>
          <p className="text-slate-400 font-bold mt-2 max-w-sm mx-auto text-sm leading-relaxed">
            Format data game tidak cocok dengan editor manapun.
          </p>
          <div className="mt-8 bg-white px-6 py-2 rounded-full border border-slate-100 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
            Template ID: {activeTemplate || "Undefined"}
          </div>
        </div>
      );
  }
}