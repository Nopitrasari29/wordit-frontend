import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

export default function RegisterPage() {

  const { register } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("STUDENT")

  async function submit(e: any) {

    e.preventDefault()

    try {

      await register(name, email, password, role)

      alert("Register success")

      navigate("/login")

    } catch (err: any) {

      alert(err.message || "Register failed")

    }

  }

  return (

    <div className="flex justify-center items-center py-20">

      <div className="bg-white shadow rounded p-8 w-full max-w-md">

        <h1 className="text-2xl font-bold mb-6 text-center">
          Register
        </h1>

        <form onSubmit={submit} className="space-y-4">

          <input
            className="w-full border px-4 py-2 rounded"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

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

          <select
            className="w-full border px-4 py-2 rounded"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >

            <option value="STUDENT">
              STUDENT
            </option>

            <option value="TEACHER">
              TEACHER
            </option>

            <option value="ADMIN">
              ADMIN
            </option>

          </select>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded"
          >
            Register
          </button>

        </form>

        <p className="text-center mt-4 text-sm">

          Already have account?

          <Link to="/login" className="text-indigo-600 ml-1">
            Login
          </Link>

        </p>

      </div>

    </div>

  )

}