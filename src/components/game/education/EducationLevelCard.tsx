type Props = {
    level: string
    description?: string
    onSelect: (level: string) => void
}

export default function EducationLevelCard({
    level,
    description,
    onSelect
}: Props) {
    // Ikon otomatis berdasarkan level
    const getIcon = (lvl: string) => {
        if (lvl.includes("SD")) return "🏫";
        if (lvl.includes("SMP")) return "🏢";
        if (lvl.includes("SMA")) return "🏛️";
        return "🎓";
    };

    return (
        <div
            onClick={() => onSelect(level)}
            className="bg-white border-4 border-slate-50 rounded-[2.5rem] p-8 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-2 hover:border-indigo-100 transition-all duration-300 group text-center flex flex-col items-center"
        >
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {getIcon(level)}
            </div>

            <h2 className="text-2xl font-black text-slate-800 mb-2">
                {level}
            </h2>

            {description && (
                <p className="text-slate-500 font-bold text-sm leading-relaxed">
                    {description}
                </p>
            )}

            <div className="mt-6 bg-slate-50 group-hover:bg-indigo-600 group-hover:text-white text-slate-400 px-4 py-2 rounded-full text-xs font-black transition-colors uppercase tracking-widest">
                Pilih Jenjang
            </div>
        </div>
    )
}