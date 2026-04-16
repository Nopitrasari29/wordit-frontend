import { Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useState, useRef, useEffect } from "react"

export default function Navbar() {
    const { user, logout } = useAuth()
    const [open, setOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <div className="fixed top-6 left-0 w-full z-50 flex justify-center px-4 font-sans pointer-events-none">
            <nav className="bg-white/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white px-6 py-3.5 rounded-full flex items-center justify-between w-full max-w-6xl transition-all pointer-events-auto">

                {/* LOGO */}
                <Link to="/" className="flex items-center gap-2 hover:scale-105 transition-transform">
                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-black text-lg shadow-inner">
                        W
                    </div>
                    <span className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
                        Word<span className="text-blue-500">IT</span>
                    </span>
                </Link>

                {/* MENU TENGAH */}
                <div className="hidden md:flex items-center gap-6 font-bold text-slate-500">
                    <Link to="/explore" className="hover:text-indigo-600 transition-colors">Explore</Link>

                    {user?.role === "STUDENT" && (
                        <>
                            <Link to="/student/dashboard" className="hover:text-indigo-600 transition-colors">Dashboard</Link>
                            <Link to="/student/join" className="hover:text-indigo-600 transition-colors">Join Game</Link>
                        </>
                    )}

                    {user?.role === "TEACHER" && (
                        <>
                            <Link to="/teacher/dashboard" className="hover:text-indigo-600 transition-colors">Dashboard</Link>
                            <Link to="/teacher/projects" className="hover:text-indigo-600 transition-colors">My Projects</Link>
                        </>
                    )}

                    {user?.role === "ADMIN" && (
                        <>
                            <Link to="/admin/dashboard" className="hover:text-indigo-600 transition-colors">Admin</Link>
                            <Link to="/admin/users" className="hover:text-indigo-600 transition-colors">Users</Link>
                        </>
                    )}
                </div>

                {/* MENU KANAN (AUTH/PROFILE) */}
                <div className="flex items-center gap-4">
                    {!user && (
                        <>
                            <Link to="/login" className="text-slate-600 font-bold hover:text-indigo-600 hidden sm:block">Login</Link>
                            <Link
                                to="/register"
                                className="bg-indigo-600 text-white px-6 py-2.5 rounded-full font-black shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-1 transition-all"
                            >
                                Register
                            </Link>
                        </>
                    )}

                    {user && (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setOpen(!open)}
                                className="flex items-center gap-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2 py-1.5 pr-4 rounded-full transition-colors"
                            >
                                <img
                                    src={user.photoUrl || "/avatar.png"}
                                    className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm bg-indigo-100"
                                    alt="Avatar"
                                />
                                <span className="font-bold text-slate-700 text-sm hidden sm:block">
                                    {user.name}
                                </span>
                                <span className="text-xs text-slate-400">▼</span>
                            </button>

                            {/* DROPDOWN */}
                            {open && (
                                <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-100 rounded-[1.5rem] shadow-[0_20px_40px_rgba(0,0,0,0.1)] overflow-hidden animate-fade-in-up origin-top-right z-50">
                                    <div className="p-2 space-y-1">
                                        <Link
                                            to="/profile"
                                            className="block px-4 py-3 font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors"
                                            onClick={() => setOpen(false)}
                                        >
                                            👤 Profile
                                        </Link>
                                        <Link
                                            to="/profile/edit"
                                            className="block px-4 py-3 font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors"
                                            onClick={() => setOpen(false)}
                                        >
                                            ⚙️ Edit Profile
                                        </Link>
                                        <div className="h-px bg-slate-100 my-1"></div>
                                        <button
                                            onClick={() => {
                                                logout();
                                                setOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-3 font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                                        >
                                            🚪 Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </nav >
        </div>
    )
}