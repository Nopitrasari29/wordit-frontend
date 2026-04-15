import { Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useState, useRef, useEffect } from "react"

export default function Navbar() {

    const { user, logout } = useAuth()

    const [open, setOpen] = useState(false)

    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {

        function handleClickOutside(event: MouseEvent) {

            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setOpen(false)
            }

        }

        document.addEventListener("mousedown", handleClickOutside)

        return () => document.removeEventListener("mousedown", handleClickOutside)

    }, [])

    return (

        <nav className="bg-white border-b sticky top-0 z-50">

            <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">

                <Link to="/" className="font-bold text-indigo-600 text-xl">
                    WordIT
                </Link>

                <div className="flex items-center gap-6">

                    <Link to="/explore">Explore</Link>

                    {user?.role === "STUDENT" && (
                        <>
                            <Link to="/student/dashboard">Dashboard</Link>
                            <Link to="/join">Join Game</Link>
                        </>
                    )}

                    {user?.role === "TEACHER" && (
                        <>
                            <Link to="/teacher/dashboard">Dashboard</Link>
                            <Link to="/teacher/projects">My Projects</Link>
                        </>
                    )}

                    {user?.role === "ADMIN" && (
                        <>
                            <Link to="/admin/dashboard">Admin</Link>
                            <Link to="/admin/users">Users</Link>
                        </>
                    )}

                    {!user && (
                        <>
                            <Link to="/login">Login</Link>
                            <Link
                                to="/register"
                                className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg"
                            >
                                Register
                            </Link>
                        </>
                    )}

                    {user && (

                        <div className="relative" ref={dropdownRef}>

                            <button
                                onClick={() => setOpen(!open)}
                                className="flex items-center gap-2"
                            >

                                <img
                                    src={user.photoUrl || "/avatar.png"}
                                    className="w-8 h-8 rounded-full object-cover"
                                />

                                <span className="font-medium">
                                    {user.name}
                                </span>

                            </button>

                            {open && (

                                <div className="absolute right-0 mt-2 w-44 bg-white border rounded-lg shadow-lg">

                                    <Link
                                        to="/profile"
                                        className="block px-4 py-2 hover:bg-gray-100"
                                    >
                                        Profile
                                    </Link>

                                    <Link
                                        to="/profile/edit"
                                        className="block px-4 py-2 hover:bg-gray-100"
                                    >
                                        Edit Profile
                                    </Link>

                                    <hr />

                                    <button
                                        onClick={logout}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
                                    >
                                        Logout
                                    </button>

                                </div>

                            )}

                        </div>

                    )}

                </div>

            </div>

        </nav>

    )
}