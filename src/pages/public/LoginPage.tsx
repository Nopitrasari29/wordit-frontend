import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import Input from "../../components/ui/Input"
import { toast } from "react-hot-toast"

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (!val) {
      setEmailError("Email wajib diisi");
    } else if (!emailRegex.test(val)) {
      setEmailError("Format email harus valid (contoh: nama@sekolah.com)");
    } else {
      setEmailError("");
    }
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (!val) {
      setPasswordError("Password wajib diisi");
    } else if (val.length < 8) {
      setPasswordError("Password harus minimal 8 karakter");
    } else {
      setPasswordError("");
    }
  };

  useEffect(() => {
    if (searchParams.get("expired") === "true") {
      toast.error("Sesi Anda telah berakhir. Silakan masuk kembali.", { id: "session-expired" });
    }
  }, [searchParams])

  async function submit(e: any) {
    e.preventDefault()
    setErrorMsg("")

    if (!emailRegex.test(email)) {
      setEmailError("Format email harus valid (contoh: nama@sekolah.com)");
      return;
    }

    if (password.length < 8) {
      setPasswordError("Password harus minimal 8 karakter");
      return;
    }

    const result = await login(email, password)

    if (result.success) {
      const storedUser = localStorage.getItem("user")
      if (!storedUser) return
      const user = JSON.parse(storedUser)

      const from = location.state?.from || null

      if (from) {
        const path = typeof from === 'string' ? from : from.pathname;
        const isFromAdmin = path.startsWith("/admin");
        const isFromTeacher = path.startsWith("/teacher");

        if (user.role === "STUDENT" && (isFromAdmin || isFromTeacher)) {
          navigate("/student/dashboard");
        } else if (user.role === "TEACHER" && isFromAdmin) {
          navigate("/teacher/dashboard");
        } else {
          if (typeof from === 'string') {
            navigate(from);
          } else {
            navigate(from.pathname + (from.search || ""));
          }
        }
      } else {
        if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") navigate("/admin/dashboard")
        else if (user.role === "TEACHER" || user.role === "SCHOOL_ADMIN") navigate("/teacher/dashboard")
        else navigate("/student/dashboard")
      }
    } else {
      setErrorMsg(result.message)
    }
  }

  return (
    <div className="min-h-screen flex justify-center items-center p-4 bg-gradient-to-br from-indigo-100 via-blue-50 to-white relative overflow-hidden font-sans pt-28 pb-12">

      {/* Dekorasi Background */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob" style={{ animationDelay: '2s' }}></div>

      {/* Card Login */}
      <div className="bg-white/80 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white rounded-[2.5rem] p-8 md:p-12 w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-indigo-600 mb-2 tracking-tight">Login</h1>
          <p className="text-slate-500 font-semibold text-sm">Masuk untuk mengelola kelasmu.</p>
        </div>

        {errorMsg && (
          <div className="mb-6 bg-rose-50 border-2 border-rose-100 text-rose-600 p-4 rounded-2xl text-sm font-bold animate-fade-in text-center">
            {errorMsg} ⚠️
          </div>
        )}

        <form onSubmit={submit} className="space-y-6">
          <Input
            label="Email"
            type="email"
            placeholder="guru@sekolah.com"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            error={emailError}
            required
          />

          <div>
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              error={passwordError}
              required
            />
            <div className="flex justify-end mt-3 mr-2">
              <Link to="/forgot-password" title="Lupa Password" className="text-sm font-bold text-indigo-500 hover:text-indigo-600 hover:underline transition-colors">
                Forgot Password?
              </Link>
            </div>
          </div>

          <button type="submit" className="w-full bg-indigo-600 text-white font-black text-lg py-4 rounded-full shadow-[0_8px_20px_rgba(79,70,229,0.3)] hover:-translate-y-1 hover:shadow-lg transition-all active:scale-95">
            Login
          </button>
        </form>

        <p className="text-center mt-8 text-sm font-semibold text-slate-500">
          Don't have an account?
          <Link to="/register" className="text-indigo-600 font-black hover:underline ml-2">Register</Link>
        </p>
      </div>
    </div>
  )
}