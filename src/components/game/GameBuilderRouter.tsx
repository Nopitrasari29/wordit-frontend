import { useSearchParams } from "react-router-dom";

// ─── IMPORT SEMUA BUILDER TEMPLATE ──────────────────────────────────
import AnagramBuilder from "./builders/AnagramBuilder";
import FlashcardBuilder from "./builders/FlashcardBuilder";
import HangmanBuilder from "./builders/HangmanBuilder";
import MazeChaseBuilder from "./builders/MazeChaseBuilder";
import SpinWheelBuilder from "./builders/SpinWheelBuilder";
import WordSearchBuilder from "./builders/WordSearchBuilder";

/**
 * Interface Props:
 * @param initialQuestions - Data hasil generate dari AI (untuk mode Create Baru).
 * @param value - Data gameJson dari database (untuk mode Edit).
 * @param onChange - Callback untuk mengirim data kembali ke parent (Page).
 * @param templateType - Fallback penentu template jika URL params kosong (mode Edit).
 */
interface GameBuilderRouterProps {
  initialQuestions?: any[];
  value: any;
  onChange: (data: any) => void;
  templateType?: string;
}

export default function GameBuilderRouter({
  initialQuestions,
  value,
  onChange,
  templateType
}: GameBuilderRouterProps) {
  const [params] = useSearchParams();

  /**
   * PENENTUAN TEMPLATE AKTIF:
   * 1. Cek parameter 'template' di URL (Contoh: ?template=ANAGRAM).
   * 2. Jika kosong (biasanya di mode Edit), gunakan prop 'templateType' dari Database.
   * 3. Jika masih kosong, coba deteksi manual dari struktur data 'value'.
   */
  const activeTemplate =
    params.get("template") ||
    templateType ||
    (value?.words ? "ANAGRAM" : null);

  // Wrapper untuk animasi transisi antar editor agar lebih smooth
  const BuilderWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="animate-fade-in transition-all duration-500">
      {children}
    </div>
  );

  // Jika data sedang di-fetch di level Page, jangan render apapun dulu
  if (!activeTemplate && !value) {
    return null;
  }

  // Gunakan Switch Case berdasarkan template yang terdeteksi (Normalisasi ke UPPERCASE)
  switch (activeTemplate?.toUpperCase()) {

    case "ANAGRAM":
      return (
        <BuilderWrapper>
          <AnagramBuilder
            value={value}
            initialData={initialQuestions}
            onChange={onChange}
          />
        </BuilderWrapper>
      );

    case "FLASHCARD":
      return (
        <BuilderWrapper>
          <FlashcardBuilder
            value={value}
            initialData={initialQuestions}
            onChange={onChange}
          />
        </BuilderWrapper>
      );

    case "HANGMAN":
      return (
        <BuilderWrapper>
          <HangmanBuilder
            value={value}
            initialData={initialQuestions}
            onChange={onChange}
          />
        </BuilderWrapper>
      );

    case "MAZE_CHASE":
      return (
        <BuilderWrapper>
          <MazeChaseBuilder
            value={value}
            initialData={initialQuestions}
            onChange={onChange}
          />
        </BuilderWrapper>
      );

    case "SPIN_THE_WHEEL":
      return (
        <BuilderWrapper>
          <SpinWheelBuilder
            value={value}
            initialData={initialQuestions}
            onChange={onChange}
          />
        </BuilderWrapper>
      );

    case "WORD_SEARCH":
      return (
        <BuilderWrapper>
          <WordSearchBuilder
            value={value}
            initialData={initialQuestions}
            onChange={onChange}
          />
        </BuilderWrapper>
      );

    // Default jika template tidak dikenali oleh sistem
    default:
      return (
        <div className="bg-slate-50 p-20 rounded-[3.5rem] border-4 border-dashed border-slate-200 text-center flex flex-col items-center justify-center">
          <div className="text-7xl mb-6 grayscale opacity-30">🧩</div>
          <h2 className="text-2xl font-black text-slate-400 uppercase tracking-tighter">
            Template Not Detected
          </h2>
          <p className="text-slate-400 font-bold mt-2 max-w-sm mx-auto text-sm leading-relaxed">
            Format data game tidak cocok dengan editor manapun atau template sedang dalam pemeliharaan.
          </p>
          <div className="mt-8 bg-white px-6 py-2 rounded-full border border-slate-100 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
            Template ID: {activeTemplate || "Undefined"}
          </div>
        </div>
      );
  }
}