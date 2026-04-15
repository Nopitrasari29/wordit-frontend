type Props = {
  title: string
  templateType: string
  educationLevel: string
}

export default function GamePreviewCard({
  title,
  templateType,
  educationLevel,
}: Props) {
  return (
    <div className="bg-white border-2 border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group cursor-pointer overflow-hidden relative">
      {/* Dekorasi Cahaya Halus */}
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-indigo-50 rounded-full blur-2xl group-hover:bg-indigo-100 transition-colors"></div>

      <div className="flex items-center gap-4 relative z-10">
        {/* Placeholder Ikon Bubbly */}
        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300 shadow-inner">
          🕹️
        </div>

        <div className="flex-1">
          <h3 className="font-black text-slate-800 text-lg mb-1 group-hover:text-indigo-600 transition-colors">
            {title}
          </h3>

          <div className="flex items-center gap-2">
            <span className="bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full">
              {templateType.replace("_", " ")}
            </span>
            <span className="text-indigo-400 font-bold text-xs">
              • {educationLevel}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}