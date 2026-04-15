import { TemplateType } from "../../types/game"

export default function GameTemplateController({
    template,
    setTemplate
}: any) {
    const templates = [
        { type: TemplateType.ANAGRAM, icon: "🧩" },
        { type: TemplateType.FLASHCARD, icon: "🎴" },
        { type: TemplateType.HANGMAN, icon: "🧗" },
        { type: TemplateType.MAZE_CHASE, icon: "🏃" },
        { type: TemplateType.SPIN_THE_WHEEL, icon: "🎡" },
        { type: TemplateType.WORD_SEARCH, icon: "🔍" }
    ]

    return (
        <div className="font-sans">
            <h2 className="text-xl font-black text-slate-800 mb-6 ml-2">Pilih Jenis Game 🎨</h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {templates.map((t) => {
                    const isActive = template === t.type;

                    return (
                        <button
                            key={t.type}
                            onClick={() => setTemplate(t.type)}
                            type="button"
                            className={`
                flex flex-col items-center justify-center p-4 rounded-[1.8rem] transition-all duration-300 border-2
                ${isActive
                                    ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 -translate-y-1"
                                    : "bg-white border-slate-100 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/50"
                                }
              `}
                        >
                            <span className="text-3xl mb-2">{t.icon}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-center leading-tight">
                                {t.type.replace(/_/g, " ")}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    )
}