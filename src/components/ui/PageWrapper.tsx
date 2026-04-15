export default function PageWrapper({ title, color, children }: Props) {
    return (
        <div className="page-enter min-h-screen bg-slate-50 font-sans">
            <div
                className="pt-32 pb-20 px-6 text-white shadow-xl relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${color}, #4f46e5)` }}
            >
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent bg-[length:40px_40px]"></div>
                <h1 className="text-5xl font-black tracking-tight relative z-10 max-w-6xl mx-auto">{title}</h1>
            </div>

            <Wave color="#f8fafc" />

            <div className="max-w-6xl mx-auto px-6 -mt-10 relative z-20 pb-20">
                {children}
            </div>
        </div>
    )
}