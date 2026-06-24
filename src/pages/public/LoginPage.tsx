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
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 font-sans relative overflow-hidden">
      {/* Branding Side (Twilight/Space theme) - Full height on desktop */}
      <div className="bg-gradient-to-tr from-[#141235] via-[#211f5c] to-[#3b2478] p-12 text-white flex flex-col justify-center w-full md:w-5/12 relative overflow-hidden min-h-[400px] md:min-h-screen pt-32 pb-16">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2"></div>
        
        {/* Floating Game Tiles */}
        <div className="absolute top-[18%] left-[12%] w-14 h-14 bg-white/[0.04] backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-center text-2xl font-black text-indigo-200/60 shadow-lg -rotate-12 animate-robot-idle" style={{ animationDelay: '0s', animationDuration: '5s' }}>W</div>
        <div className="absolute top-[28%] right-[15%] w-10 h-10 bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/5 flex items-center justify-center text-xl font-black text-purple-200/50 shadow-md rotate-12 animate-robot-idle" style={{ animationDelay: '1s', animationDuration: '6s' }}>o</div>
        <div className="absolute bottom-[35%] left-[10%] w-12 h-12 bg-white/[0.04] backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-center text-xl font-black text-indigo-300/60 shadow-md rotate-45 animate-robot-idle" style={{ animationDelay: '2s', animationDuration: '5.5s' }}>r</div>
        <div className="absolute bottom-[20%] right-[15%] w-14 h-14 bg-white/[0.05] backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-center text-2xl font-black text-indigo-100/70 shadow-lg -rotate-6 animate-robot-idle" style={{ animationDelay: '1.5s', animationDuration: '4.8s' }}>d</div>
        <div className="absolute top-[52%] right-[25%] w-8 h-8 bg-white/[0.03] backdrop-blur-sm rounded-lg border border-white/5 flex items-center justify-center text-md font-black text-indigo-300/40 shadow-sm rotate-12 animate-robot-idle" style={{ animationDelay: '0.5s', animationDuration: '6.5s' }}>I</div>
        <div className="absolute bottom-[10%] left-[25%] w-10 h-10 bg-white/[0.04] backdrop-blur-sm rounded-xl border border-white/10 flex items-center justify-center text-lg font-black text-purple-300/60 shadow-md -rotate-12 animate-robot-idle" style={{ animationDelay: '2.5s', animationDuration: '5.2s' }}>T</div>

        <div className="relative z-10 max-w-md mx-auto md:mx-0 text-left">
          <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tight leading-none italic uppercase">
            Word<span className="text-indigo-400 drop-shadow-[0_0_15px_rgba(129,140,248,0.5)]">IT</span>
          </h2>
          <p className="text-slate-300 font-semibold text-lg leading-relaxed">
            Portal masuk kuis interaktif, statistik kelas, dan manajemen arena belajar mandiri Anda.
          </p>
          <div className="mt-14 text-6xl hidden md:block animate-robot-idle text-indigo-400/90 drop-shadow-[0_0_10px_rgba(129,140,248,0.35)]">🎮</div>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full md:w-7/12 bg-[#f8fafc]/60 px-8 py-16 md:px-16 md:py-28 flex items-center justify-center min-h-screen overflow-y-auto relative">
        {/* Glow Effects in Form Side */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px] animate-blob"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-[100px] animate-blob" style={{ animationDelay: '3s' }}></div>

        <div className="w-full max-w-2xl bg-white/80 backdrop-blur-xl p-12 md:p-16 rounded-[3.5rem] shadow-[0_20px_50px_rgba(79,70,229,0.06)] border border-white/60 relative z-10">
          <div className="mb-10 text-center">
            <h1 className="text-6xl md:text-7xl font-black text-indigo-600 tracking-tight mb-2 uppercase">Login</h1>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Selamat Datang!</h2>
            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mt-2">Masuk untuk mengelola kelas & kuis</p>
          </div>

          {errorMsg && (
            <div className="mb-6 bg-rose-50 border-2 border-rose-100 text-rose-600 p-4 rounded-2xl text-xs font-black animate-fade-in text-center flex items-center justify-center gap-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
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
                <Link to="/forgot-password" title="Lupa Password" className="text-sm font-black text-indigo-600 hover:text-indigo-500 hover:underline transition-colors uppercase tracking-wider">
                  Forgot Password?
                </Link>
              </div>
            </div>

            <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-black text-lg uppercase tracking-widest py-5 rounded-full shadow-lg shadow-indigo-600/20 active:scale-98 transition-all duration-300">
              Login 🚀
            </button>
          </form>

          <p className="text-center mt-10 text-sm font-black uppercase tracking-wider text-slate-400">
            Belum punya akun?
            <Link to="/register" className="text-indigo-600 font-black hover:underline ml-2 normal-case tracking-normal">Register di sini</Link>
          </p>
        </div>
      </div>
    </div>
  );
}