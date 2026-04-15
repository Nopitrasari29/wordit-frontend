import { Link } from "react-router-dom" // Menambahkan Link agar user bisa pulang

export default function NotFoundPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 text-center font-sans relative overflow-hidden">

            {/* Awan / Daun Animasi di Background */}
            <div className="absolute top-[10%] left-[20%] w-32 h-32 bg-emerald-100 rounded-full blur-2xl opacity-60"></div>
            <div className="absolute bottom-[20%] right-[10%] w-48 h-48 bg-indigo-100 rounded-full blur-3xl opacity-60" style={{ animationDelay: '1s' }}></div>

            <div className="relative z-10 max-w-lg">

                {/* Gambar 404 Bubbly */}
                <div className="text-[120px] md:text-[150px] leading-none font-black text-slate-200 mb-6 flex justify-center items-center gap-4 drop-shadow-sm">
                    <span>4</span>
                    {/* Maskot / Bola mata kebingungan */}
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-indigo-600 rounded-full shadow-inner flex items-center justify-center animate-bounce">
                        <span className="text-5xl md:text-6xl">😵‍💫</span>
                    </div>
                    <span>4</span>
                </div>

                <h1 className="text-3xl md:text-5xl font-black text-slate-800 mb-4 tracking-tight">
                    Oops! Tersesat?
                </h1>

                <p className="text-slate-500 text-lg font-medium mb-10 leading-relaxed">
                    Sepertinya halaman yang kamu cari belum ada atau sudah dipindahkan. Ayo kembali bermain!
                </p>

                {/* Kamu mungkin butuh router link di sini */}
                <Link
                    to="/"
                    className="inline-block bg-indigo-600 text-white px-10 py-4 rounded-full font-black text-lg shadow-[0_8px_20px_rgba(79,70,229,0.3)] hover:-translate-y-1 transition-all"
                >
                    🏠 Kembali ke Beranda
                </Link>

            </div>

        </div>
    )
}