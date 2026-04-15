import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import Button from "../../components/ui/Button"
import Input from "../../components/ui/Input"

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
    <div className="min-h-screen flex justify-center items-center p-4 bg-gradient-to-br from-indigo-100 via-blue-50 to-white relative overflow-hidden font-sans">

      {/* Dekorasi Background */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob" style={{ animationDelay: '2s' }}></div>

      {/* Card Wrapper (Split Layout) */}
      <div className="bg-white/90 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white rounded-[3rem] w-full max-w-4xl relative z-10 flex flex-col md:flex-row overflow-hidden">

        {/* Sisi Kiri - Branding */}
        <div className="bg-indigo-600 p-10 md:p-12 text-white flex flex-col justify-center w-full md:w-5/12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>

          <h2 className="text-4xl font-black mb-4 tracking-tight relative z-10">
            Bergabung dengan Word<span className="text-blue-300">IT</span>!
          </h2>
          <p className="text-indigo-100 font-semibold text-lg relative z-10">
            Buat akunmu sekarang dan rasakan pengalaman belajar yang belum pernah ada sebelumnya.
          </p>

          <div className="mt-10 text-6xl hidden md:block animate-bounce">🚀</div>
        </div>

        {/* Sisi Kanan - Form */}
        <div className="p-8 md:p-12 w-full md:w-7/12">
          <h1 className="text-2xl font-black text-slate-800 mb-6">
            Register Akun Baru
          </h1>

          <form onSubmit={submit} className="space-y-5">
            <Input
              label="Full Name"
              placeholder="Budi Santoso"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Input
              label="Email"
              type="email"
              placeholder="budi@sekolah.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="w-full flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700 ml-2">Daftar Sebagai</label>
              <select
                className="w-full bg-slate-50 text-slate-800 px-6 py-4 rounded-full border-2 border-slate-100 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all font-bold appearance-none cursor-pointer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="STUDENT">🎓 Siswa (Student)</option>
                <option value="TEACHER">👨‍🏫 Guru (Teacher)</option>
                <option value="ADMIN">🛡️ Admin</option>
              </select>
            </div>

            <Button type="submit" isFullWidth className="mt-8">
              Register Sekarang
            </Button>
          </form>

          <p className="text-center mt-6 text-sm font-semibold text-slate-500">
            Already have an account?
            <Link to="/login" className="text-indigo-600 font-black hover:underline ml-2">
              Login
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}