export default function TemplatePreview({ templateType }: Props) {
  const content: any = {
    ANAGRAM: { text: "Rearrange letters to form words", icon: "🧩" },
    FLASHCARD: { text: "Flip cards to learn concepts", icon: "🎴" },
    HANGMAN: { text: "Guess the hidden word", icon: "🧗" },
    MAZE_CHASE: { text: "Navigate maze to find answers", icon: "🏃" },
    SPIN_THE_WHEEL: { text: "Spin wheel to get questions", icon: "🎡" },
    WORD_SEARCH: { text: "Find hidden words", icon: "🔍" },
  }

  const current = content[templateType] || { text: "Pilih template untuk melihat deskripsi.", icon: "🎮" };

  return (
    <div className="bg-slate-50 border-4 border-dashed border-slate-200 rounded-[2.5rem] p-8 text-center flex flex-col items-center justify-center">
      <div className="text-6xl mb-4">{current.icon}</div>
      <h2 className="text-xl font-black text-slate-800 mb-2">Template Preview</h2>
      <p className="text-slate-500 font-bold leading-relaxed max-w-xs">{current.text}</p>
    </div>
  )
}