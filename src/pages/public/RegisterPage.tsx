import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"

export default function RegisterPage() {

    const navigate = useNavigate()

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    function handleRegister(e: any) {

        e.preventDefault()

        const users = JSON.parse(localStorage.getItem("users") || "[]")

        const exists = users.find(
            (u: any) => u.email === email
        )

        if (exists) {

            alert("Email sudah terdaftar")
            return

        }

        const newUser = {

            id: crypto.randomUUID(),
            name,
            email,
            password,

            /* ROLE TIDAK BISA DIPILIH USER */

            role: "STUDENT",

            createdAt: new Date().toISOString()

        }

        users.push(newUser)

        localStorage.setItem(
            "users",
            JSON.stringify(users)
        )

        alert("Register berhasil")

        navigate("/login")

    }

    return (

        <div className="flex justify-center items-center h-screen bg-gray-100">

            <form
                onSubmit={handleRegister}
                className="bg-white p-8 rounded-xl shadow w-[400px] space-y-4"
            >

                <h1 className="text-2xl font-bold text-center">
                    Register
                </h1>

                <input
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border w-full p-3 rounded"
                />

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
                    Register
                </button>

                <p className="text-center text-sm">

                    Sudah punya akun?

                    <Link
                        to="/login"
                        className="text-blue-600 ml-2"
                    >
                        Login
                    </Link>

                </p>

            </form>

        </div>

    )

}