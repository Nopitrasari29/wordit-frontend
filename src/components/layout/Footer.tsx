import { Link } from "react-router-dom"

export default function Footer() {
    return (
        <footer className="bg-slate-900 pt-20 pb-10 px-6 rounded-t-[3rem] mt-20 font-sans relative overflow-hidden">

            {/* Efek Cahaya Latar */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600 opacity-20 rounded-full blur-3xl -translate-y-1/2 pointer-events-none"></div>

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 mb-16">

                    {/* Brand Info */}
                    <div className="md:col-span-2">
                        <Link to="/" className="flex items-center gap-2 mb-6 w-max hover:scale-105 transition-transform">
                            <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-black text-xl shadow-inner">W</div>
                            <span className="text-2xl font-black text-white tracking-tight">Word<span className="text-blue-400">IT</span></span>
                        </Link>
                        <p className="text-slate-400 font-medium leading-relaxed max-w-sm">
                            Platform pembelajaran berbasis game yang membuat kelas menjadi lebih interaktif, menyenangkan, dan penuh semangat!
                        </p>
                    </div>

                    {/* Links 1 */}
                    <div>
                        <h4 className="text-white font-black mb-6 tracking-widest uppercase text-sm">Platform</h4>
                        <ul className="space-y-4 font-bold text-slate-400">
                            <li><Link to="/explore" className="hover:text-indigo-400 transition-colors">Eksplor Game</Link></li>
                            <li><Link to="/ranking" className="hover:text-indigo-400 transition-colors">Leaderboard</Link></li>
                        </ul>
                    </div>

                    {/* Links 2 */}
                    <div>
                        <h4 className="text-white font-black mb-6 tracking-widest uppercase text-sm">Bantuan</h4>
                        <ul className="space-y-4 font-bold text-slate-400">
                            <li><Link to="/" className="hover:text-indigo-400 transition-colors">Panduan Guru</Link></li>
                            <li><Link to="/" className="hover:text-indigo-400 transition-colors">FAQ</Link></li>
                        </ul>
                    </div>

                </div>

                {/* Bottom Copyright */}
                <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-bold text-slate-500">
                    <p>© 2026 WordIT - Gamified Learning Platform</p>
                    <div className="flex gap-6">
                        <Link to="/" className="hover:text-white transition-colors">Privasi</Link>
                        <Link to="/" className="hover:text-white transition-colors">Syarat & Ketentuan</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}