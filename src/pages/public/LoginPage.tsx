import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

export default function LoginPage() {

    const navigate = useNavigate()
    const { login } = useAuth()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    function handleLogin(e: any) {

        e.preventDefault()

        const users = JSON.parse(localStorage.getItem("users") || "[]")

        const user = users.find(
            (u: any) => u.email === email && u.password === password
        )

        if (!user) {

            alert("Email atau password salah")
            return

        }

        login(user)

        /* Redirect berdasarkan role */

        if (user.role === "ADMIN") {

            navigate("/admin/dashboard")

        } else if (user.role === "TEACHER") {

            navigate("/dashboard")

        } else {

            navigate("/student/dashboard")

        }

    }

    return (

        <div className="flex justify-center items-center h-screen bg-gray-100">

            <form
                onSubmit={handleLogin}
                className="bg-white p-8 rounded-xl shadow w-[400px] space-y-4"
            >

                <h1 className="text-2xl font-bold text-center">
                    Login
                </h1>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border w-full p-3 rounded"
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border w-full p-3 rounded"
                />

                <button
                    className="bg-indigo-600 text-white w-full py-2 rounded"
                >
                    Login
                </button>

                <div className="flex justify-between text-sm">

                    <Link
                        to="/forgot-password"
                        className="text-blue-600"
                    >
                        Forgot Password?
                    </Link>

                    <Link
                        to="/register"
                        className="text-blue-600"
                    >
                        Register
                    </Link>

                </div>

            </form>

        </div>

    )

}