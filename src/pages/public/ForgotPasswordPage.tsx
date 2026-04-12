import { Link } from "react-router-dom"
import { useState } from "react"

export default function ForgotPasswordPage() {

    const [email, setEmail] = useState("")

    const handleSubmit = (e: React.FormEvent) => {

        e.preventDefault()

        console.log("Reset password:", email)

    }

    return (

        <div className="flex justify-center items-center min-h-screen bg-gray-100">

            <div className="bg-white shadow-lg rounded-xl p-10 w-[420px]">

                <h1 className="text-2xl font-bold text-center mb-4">
                    Reset Password
                </h1>

                <form onSubmit={handleSubmit} className="space-y-4">

                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border px-3 py-2 rounded-lg"
                        required
                    />

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white py-2 rounded-lg"
                    >
                        Send Reset Link
                    </button>

                </form>

                <p className="text-sm text-center mt-6">

                    Back to

                    <Link
                        to="/login"
                        className="text-indigo-600 ml-1"
                    >
                        Login
                    </Link>

                </p>

            </div>

        </div>

    )

}