export default function AnalyticsStudentPage() {
    return (
        <div className="max-w-6xl mx-auto py-10 px-6 font-sans">
            <h1 className="text-3xl font-black text-slate-800 mb-8 tracking-tight">My Learning Analytics 📈</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center text-center group hover:-translate-y-2 transition-all">
                    <p className="text-slate-500 font-bold mb-2">Games Played</p>
                    <h2 className="text-5xl font-black text-indigo-600 group-hover:scale-110 transition-transform">24</h2>
                </div>

                <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-8 rounded-[2.5rem] shadow-lg text-white flex flex-col items-center text-center group hover:-translate-y-2 transition-all">
                    <p className="opacity-80 font-bold mb-2 text-white">Accuracy</p>
                    <h2 className="text-5xl font-black group-hover:scale-110 transition-transform">78%</h2>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center text-center group hover:-translate-y-2 transition-all">
                    <p className="text-slate-500 font-bold mb-2">Avg Score</p>
                    <h2 className="text-5xl font-black text-emerald-500 group-hover:scale-110 transition-transform">82</h2>
                </div>
            </div>
        </div>
    )
}