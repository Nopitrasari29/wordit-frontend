import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { toast } from "react-hot-toast"
import Button from "../../components/ui/Button"
import Input from "../../components/ui/Input"

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("STUDENT")
  // State baru untuk EducationLevel sesuai Enum di Prisma
  const [educationLevel, setEducationLevel] = useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)

  // Reset educationLevel jika user pindah role ke STUDENT
  useEffect(() => {
    if (role === "STUDENT") {
      setEducationLevel(undefined)
    }
  }, [role])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password.length < 6) {
      return toast.error("Password minimal 6 karakter!")
    }

    // Validasi: Teacher wajib pilih jenjang (Sprint 2 - BE-NEW-04)
    if (role === "TEACHER" && !educationLevel) {
      return toast.error("Guru wajib memilih satu jenjang pendidikan!")
    }

    // Validasi: Blokir register Admin (Sprint 2 - BE-NEW-03)
    if (role === "ADMIN") {
      return toast.error("Pendaftaran Admin hanya bisa dilakukan melalui sistem internal.")
    }

    setIsLoading(true)
    try {
      // Pastikan AuthContext.register kamu diupdate untuk menerima educationLevel
      await register(name, email, password, role, educationLevel)

      if (role === "TEACHER") {
        toast.success("Registrasi berhasil! Mohon tunggu approval Admin. ⏳")
      } else {
        toast.success("Akun Berhasil Dibuat! 🚀")
      }
      navigate("/login")
    } catch (err: any) {
      const msg = err.response?.data?.message || "Register gagal. Cek koneksi server!"
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex justify-center items-center p-4 bg-gradient-to-br from-indigo-100 via-blue-50 to-white relative overflow-hidden font-sans pt-28 pb-12">
      {/* Background Decor Tetap Sama */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob" style={{ animationDelay: '2s' }}></div>

      <div className="bg-white/90 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white rounded-[3rem] w-full max-w-4xl relative z-10 flex flex-col md:flex-row overflow-hidden">

        {/* Branding Side Tetap Sama */}
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

        {/* Form Side */}
        <div className="p-8 md:p-12 w-full md:w-7/12 bg-white">
          <h1 className="text-2xl font-black text-slate-800 mb-6 tracking-tight">Register Akun Baru</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Full Name" placeholder="Budi Santoso" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Email" type="email" placeholder="budi@sekolah.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />

            <div className="w-full flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700 ml-2">Daftar Sebagai</label>
              <div className="relative">
                <select
                  className="w-full bg-slate-50 text-slate-800 px-6 py-4 rounded-full border-2 border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all font-bold appearance-none cursor-pointer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="STUDENT">🎓 Siswa (Student)</option>
                  <option value="TEACHER">👨‍🏫 Guru (Teacher)</option>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 font-bold">▼</div>
              </div>
            </div>

            {/* SEKSI BARU: Radio Button Education Level untuk Teacher (Sprint 2 - FE-NEW-03) */}
            {role === "TEACHER" && (
              <div className="w-full flex flex-col gap-3 p-4 bg-indigo-50 rounded-3xl border border-indigo-100 transition-all animate-in fade-in slide-in-from-top-2">
                <label className="text-xs font-black uppercase tracking-wider text-indigo-600 ml-2">
                  Pilih Satu Jenjang Pendidikan
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["SD", "SMP", "SMA", "UNIVERSITY"].map((level) => (
                    <label
                      key={level}
                      className={`flex items-center justify-center p-3 rounded-2xl border-2 cursor-pointer transition-all font-bold text-sm
                        ${educationLevel === level
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200"
                          : "bg-white border-slate-100 text-slate-500 hover:border-indigo-200"}`}
                    >
                      <input
                        type="radio"
                        name="educationLevel"
                        value={level}
                        className="hidden"
                        onChange={(e) => setEducationLevel(e.target.value)}
                      />
                      {level}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <Button type="submit" isFullWidth disabled={isLoading} className="mt-8 shadow-xl shadow-indigo-100">
              {isLoading ? "Sedang Mendaftar..." : "Register Sekarang"}
            </Button>
          </form>

          <p className="text-center mt-6 text-sm font-semibold text-slate-500">
            Already have an account?
            <Link to="/login" className="text-indigo-600 font-black hover:underline ml-2">Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}