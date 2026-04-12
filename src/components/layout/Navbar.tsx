import { Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useState } from "react"

export default function Navbar() {

    const { user, logout } = useAuth()
    const [open, setOpen] = useState(false)

    return (

        <nav className="bg-white border-b">

            <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">

                {/* LOGO */}

                <Link to="/" className="font-bold text-lg">
                    WordIT
                </Link>

                {/* MENU */}

                <div className="flex gap-6 items-center">

                    <Link to="/explore">
                        Explore
                    </Link>

                    <Link to="/join">
                        Join Game
                    </Link>


                    {/* BEFORE LOGIN */}

                    {!user && (

                        <>

                            <Link
                                to="/login"
                                className="text-indigo-600"
                            >
                                Login
                            </Link>

                            <Link
                                to="/register"
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
                            >
                                Register
                            </Link>

                        </>

                    )}


                    {/* AFTER LOGIN */}

                    {user && (

                        <>

                            {/* TEACHER MENU */}

                            {user.role === "teacher" && (

                                <>

                                    <Link to="/dashboard">
                                        Dashboard
                                    </Link>

                                    <Link to="/my-projects">
                                        My Projects
                                    </Link>

                                    <Link to="/game/choose-level">
                                        Create Game
                                    </Link>

                                    <Link to="/analytics">
                                        Analytics
                                    </Link>

                                </>

                            )}


                            {/* STUDENT MENU */}

                            {user.role === "student" && (

                                <>

                                    <Link to="/student/dashboard">
                                        Dashboard
                                    </Link>

                                    <Link to="/student/analytics">
                                        My Results
                                    </Link>

                                </>

                            )}


                            {/* ADMIN MENU */}

                            {user.role === "admin" && (

                                <>

                                    <Link to="/admin/dashboard">
                                        Admin
                                    </Link>

                                    <Link to="/admin/users">
                                        Users
                                    </Link>

                                    <Link to="/admin/logs">
                                        Logs
                                    </Link>

                                </>

                            )}


                            {/* PROFILE DROPDOWN */}

                            <div className="relative">

                                <button
                                    onClick={() => setOpen(!open)}
                                    className="flex items-center gap-1"
                                >

                                    {user.email} ▼

                                </button>

                                {open && (

                                    <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow">

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

                                        <button
                                            onClick={logout}
                                            className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
                                        >
                                            Logout
                                        </button>

                                    </div>

                                )}

                            </div>

                        </>

                    )}

                </div>

            </div>

        </nav>

    )

}