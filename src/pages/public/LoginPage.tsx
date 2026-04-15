import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

export default function LoginPage() {

  const { login } = useAuth()

  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  async function submit(e: any) {

    e.preventDefault()

    await login(email, password)

    const storedUser = localStorage.getItem("user")

    if (!storedUser) return

    const user = JSON.parse(storedUser)

    if (user.role === "ADMIN") {
      navigate("/admin/dashboard")
    }
    else if (user.role === "TEACHER") {
      navigate("/teacher/dashboard")
    }
    else {
      navigate("/student/dashboard")
    }

  }

  return (

    <div className="flex justify-center items-center py-20">

      <div className="bg-white shadow rounded p-8 w-full max-w-md">

        <h1 className="text-2xl font-bold mb-6 text-center">
          Login
        </h1>

        <form onSubmit={submit} className="space-y-4">

          <input
            className="w-full border px-4 py-2 rounded"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            className="w-full border px-4 py-2 rounded"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded"
          >
            Login
          </button>

        </form>

        <p className="text-center mt-4 text-sm">

          Don't have an account?

          <Link to="/register" className="text-indigo-600 ml-2">
            Register
          </Link>

        </p>

      </div>

    </div>

  )

}