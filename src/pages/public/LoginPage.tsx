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
    <div className="min-h-screen flex justify-center items-center p-4 bg-gradient-to-br from-indigo-100 via-blue-50 to-white relative overflow-hidden font-sans">

      {/* Dekorasi Background */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob" style={{ animationDelay: '2s' }}></div>

      {/* Card Login */}
      <div className="bg-white/80 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white rounded-[2.5rem] p-8 md:p-12 w-full max-w-md relative z-10">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-indigo-600 mb-2 tracking-tight">
            Login
          </h1>
          <p className="text-slate-500 font-semibold text-sm">Masuk untuk mengelola kelasmu.</p>
        </div>

        <form onSubmit={submit} className="space-y-6">

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-2">Email</label>
            <input
              type="email"
              className="w-full bg-slate-50 text-slate-800 px-6 py-4 rounded-full border-2 border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all font-semibold placeholder:font-normal"
              placeholder="guru@sekolah.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-2">Password</label>
            <input
              type="password"
              className="w-full bg-slate-50 text-slate-800 px-6 py-4 rounded-full border-2 border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all font-semibold"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {/* TAUTAN LUPA PASSWORD DITAMBAHKAN DI SINI */}
            <div className="flex justify-end mt-3 mr-2">
              <Link to="/forgot-password" className="text-sm font-bold text-indigo-500 hover:text-indigo-600 hover:underline transition-colors">
                Forgot Password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-black text-lg py-4 rounded-full shadow-[0_8px_20px_rgba(79,70,229,0.3)] hover:-translate-y-1 hover:shadow-lg transition-all"
          >
            Login
          </button>
        </form>

        <p className="text-center mt-8 text-sm font-semibold text-slate-500">
          Don't have an account?
          <Link to="/register" className="text-indigo-600 font-black hover:underline ml-2">
            Register
          </Link>
        </p>

      </div>
    </div>
  )
}