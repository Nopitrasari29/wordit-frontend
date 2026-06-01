import AnagramEngine from "./engines/AnagramEngine";
import FlashcardEngine from "./engines/FlashcardEngine";
import HangmanEngine from "./engines/HangmanEngine";
import MazeChaseEngine from "./engines/MazeChaseEngine";
import SpinWheelEngine from "./engines/SpinWheelEngine";
import WordSearchEngine from "./engines/WordSearchEngine";

import MultipleChoiceEngine from "./engines/MultipleChoiceEngine";
import TrueFalseEngine from "./engines/TrueFalseEngine";
import MatchingEngine from "./engines/MatchingEngine";
import EssayEngine from "./engines/EssayEngine";

interface Props {
  templateType: any;
  gameData: any;

  onIntermission?: () => void;

  onGameOver?: (
    score?: number,
    accuracy?: number,
    breakdown?: any[]
  ) => void;
}

const EngineWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <div className="w-full h-full flex items-center justify-center p-2 animate-fade-in">
    {children}
  </div>
);

export default function GameRenderer({
  templateType,
  gameData,
  onIntermission,
  onGameOver,
}: Props) {

  console.log("🛠️ DEBUG RENDERER:", {
    receivedType: templateType,
    typeOfReceived: typeof templateType,
    data: gameData,
  });

  let finalType = "";

  if (typeof templateType === "string") {
    finalType = templateType;
  } else if (
    templateType &&
    typeof templateType === "object"
  ) {
    finalType =
      templateType.templateType ||
      templateType.template ||
      "";
  }

  if (
    !finalType &&
    gameData?.templateType
  ) {
    finalType =
      gameData.templateType;
  }

  const type =
    finalType
      ?.toUpperCase()
      .trim();

  const sharedProps = {
    data: gameData,
    onIntermission,
    onGameOver,
  };

  const renderEngine = (Engine: any) => (
    <Engine {...sharedProps} />
  );

  switch (type) {

    case "ANAGRAM":
      return (
        <EngineWrapper>
          {renderEngine(AnagramEngine)}
        </EngineWrapper>
      );

    case "FLASHCARD":
      return (
        <EngineWrapper>
          {renderEngine(FlashcardEngine)}
        </EngineWrapper>
      );

    case "HANGMAN":
      return (
        <EngineWrapper>
          {renderEngine(HangmanEngine)}
        </EngineWrapper>
      );

    case "MAZE_CHASE":
      return (
        <EngineWrapper>
          {renderEngine(MazeChaseEngine)}
        </EngineWrapper>
      );

    case "SPIN_THE_WHEEL":
    case "SPIN_WHEEL":
      return (
        <EngineWrapper>
          {renderEngine(SpinWheelEngine)}
        </EngineWrapper>
      );

    case "WORD_SEARCH":
      return (
        <EngineWrapper>
          {renderEngine(WordSearchEngine)}
        </EngineWrapper>
      );

    case "MULTIPLE_CHOICE":
      return (
        <EngineWrapper>
          {renderEngine(MultipleChoiceEngine)}
        </EngineWrapper>
      );

    case "TRUE_FALSE":
      return (
        <EngineWrapper>
          {renderEngine(TrueFalseEngine)}
        </EngineWrapper>
      );

    case "MATCHING":
      return (
        <EngineWrapper>
          {renderEngine(MatchingEngine)}
        </EngineWrapper>
      );

    case "ESSAY":
      return (
        <EngineWrapper>
          {renderEngine(EssayEngine)}
        </EngineWrapper>
      );

    default:
      return (
        <div className="text-center p-16 bg-white rounded-[3rem] border-4 border-dashed border-slate-100 max-w-md mx-auto flex flex-col items-center justify-center">
          <div className="text-7xl mb-6 grayscale opacity-20">
            🕹️
          </div>

          <h2 className="text-xl font-black text-slate-400 uppercase tracking-tighter italic leading-none">
            Arena Not Ready
          </h2>

          <div className="space-y-1 mt-4">
            <p className="font-bold text-slate-300 uppercase tracking-[0.2em] text-[9px]">
              LOG:{" "}
              {type
                ? `TYPE "${type}" UNKNOWN`
                : "EMPTY_TYPE"}
            </p>

            <p className="text-[8px] text-slate-200 font-mono">
              RAW:{" "}
              {JSON.stringify(
                templateType
              )?.substring(
                0,
                30
              )}
              ...
            </p>
          </div>

          <div className="mt-8 bg-indigo-50 px-8 py-3 rounded-full border border-indigo-100 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
            PERIKSA CONSOLE (F12)
          </div>
        </div>
      );
  }
}