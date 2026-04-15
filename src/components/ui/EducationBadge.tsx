export default function EducationBadge({ level }: Props) {
    const colors: any = {
        SD: "bg-emerald-500",
        SMP: "bg-blue-500",
        SMA: "bg-indigo-500",
        UNIVERSITY: "bg-rose-500",
    };
    return (
        <span className={`${colors[level] || "bg-slate-500"} text-white text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full shadow-sm`}>
            {level}
        </span>
    );
}