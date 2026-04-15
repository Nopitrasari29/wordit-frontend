export default function SectionTitle({ title, subtitle }: Props) {
    return (
        <div className="text-center mb-16 px-4">
            <h2 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-tight">
                {title}
            </h2>
            {subtitle && <p className="text-slate-500 font-bold mt-4 text-lg max-w-2xl mx-auto leading-relaxed">{subtitle}</p>}
        </div>
    );
}