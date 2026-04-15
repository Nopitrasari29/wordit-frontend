import { templateIcons } from "../../../data/templateIcons"

export default function GameCard({ game }: any) {
  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300 hover:-translate-y-2 cursor-pointer flex flex-col group">

      {/* BIG ICON AREA */}
      <div className="bg-slate-100 h-32 rounded-[1.5rem] mb-6 flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-300">
        {templateIcons[game.templateType] || "🎮"}
      </div>

      {/* TITLE */}
      <h3 className="font-black text-xl text-slate-800 mb-3 truncate">
        {game.title}
      </h3>

      {/* TAGS */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold capitalize truncate max-w-[120px]">
          {game.templateType.replace("_", " ").toLowerCase()}
        </span>
        <span className="bg-slate-50 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
          {game.educationLevel}
        </span>
      </div>

      {/* FOOTER AREA */}
      <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
        <p className="text-xs text-slate-400 font-bold">
          Diff: <span className="text-slate-600">{game.difficulty}</span>
        </p>
        <p className="text-xs text-indigo-500 font-black bg-indigo-50 px-3 py-1.5 rounded-full flex items-center gap-1">
          <span>▶</span> {game.playCount} plays
        </p>
      </div>

    </div>
  )
}