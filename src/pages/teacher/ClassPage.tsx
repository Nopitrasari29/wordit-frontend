export default function ClassPage() {
    const classes = [
        { name: "Class A", students: 20, icon: "🍎" },
        { name: "Class B", students: 18, icon: "📗" },
        { name: "Class C", students: 22, icon: "🧪" }
    ]

    return (
        <div className="max-w-6xl mx-auto py-10 px-6 font-sans">
            <h1 className="text-3xl font-black text-slate-800 mb-8 tracking-tight">Daftar Kelas 🏫</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {classes.map((c, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center text-center group hover:-translate-y-2 transition-all">
                        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center text-4xl mb-6 shadow-inner group-hover:scale-110 transition-transform">
                            {c.icon}
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 mb-2">{c.name}</h2>
                        <p className="text-slate-400 font-bold mb-6">Students: {c.students}</p>

                        <button className="w-full bg-slate-100 hover:bg-indigo-600 hover:text-white text-indigo-600 py-3 rounded-2xl font-black transition-all">
                            View Class
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}