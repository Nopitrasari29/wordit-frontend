import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <footer className="bg-slate-950 text-slate-300 pt-20 pb-10 px-6 mt-auto">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-slate-800 pb-12 mb-10">
                {/* Brand */}
                <div className="space-y-4">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg">W</div>
                        <span className="text-2xl font-black text-white tracking-tight">Word<span className="text-indigo-400">IT</span></span>
                    </Link>
                    <p className="text-sm font-semibold text-slate-400 leading-relaxed">
                        Platform kuis interaktif Moodle Classroom & Public Discovery.
                    </p>
                </div>

                {/* Links */}
                <div>
                    <h5 className="font-black text-white uppercase text-xs tracking-widest mb-5">Platform</h5>
                    <Link to="/explore" className="block text-sm font-semibold hover:text-indigo-400 mb-2">Eksplor Game</Link>
                </div>
                <div>
                    <h5 className="font-black text-white uppercase text-xs tracking-widest mb-5">Bantuan</h5>
                    <Link to="/faq" className="block text-sm font-semibold hover:text-indigo-400 mb-2">FAQ</Link>
                </div>
                <div>
                    <h5 className="font-black text-white uppercase text-xs tracking-widest mb-5">Legal</h5>
                    <Link to="/privacy" className="block text-sm font-semibold hover:text-indigo-400 mb-2">Privasi</Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto text-center text-slate-500 font-bold text-xs uppercase tracking-widest">
                © 2026 WordIT Hybrid Learning Ecosystem.
            </div>
        </footer>
    );
}