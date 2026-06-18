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
  const [educationLevels, setEducationLevels] = useState<string[]>([])
  const [schoolOrigin, setSchoolOrigin] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)

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
    setEducationLevels([]);
  }, [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      return toast.error("Nama lengkap wajib diisi!");
    }

    if (!emailRegex.test(email)) {
      setEmailError("Format email harus valid (contoh: nama@sekolah.com)");
      return toast.error("Format email tidak valid!");
    }

    if (password.length < 8) {
      setPasswordError("Password harus minimal 8 karakter");
      return toast.error("Password minimal 8 karakter!");
    }

    if (role === "TEACHER" && educationLevels.length === 0) {
      return toast.error("Guru wajib memilih minimal satu jenjang pendidikan!");
    }

    if (role === "STUDENT" && educationLevels.length === 0) {
      return toast.error("Siswa wajib memilih jenjang pendidikan!");
    }

    if (!schoolOrigin.trim()) {
      return toast.error("Asal Sekolah/Institusi wajib diisi!");
    }

    if (!phoneNumber.trim()) {
      return toast.error("Nomor HP / WhatsApp wajib diisi!");
    }

    if (role === "ADMIN") {
      return toast.error("Pendaftaran Admin hanya bisa dilakukan melalui sistem internal.");
    }

    setIsLoading(true);
    try {
      await register(name, email, password, role, educationLevels, schoolOrigin.trim(), phoneNumber.trim());

      toast.success("Registrasi berhasil! Silakan verifikasi email Anda. 🚀");
      navigate(`/verify-pending?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Register gagal. Cek koneksi server!";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white font-sans relative">
      {/* Branding Side (Ungu) - Ngefill 100% tinggi di desktop */}
      <div className="bg-indigo-600 p-12 text-white flex flex-col justify-center w-full md:w-5/12 relative overflow-hidden min-h-[350px] md:min-h-screen pt-32 pb-16">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative z-10 max-w-md mx-auto md:mx-0 text-left">
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight leading-tight">
            Bergabung dengan Word<span className="text-blue-300">IT</span>!
          </h2>
          <p className="text-indigo-100 font-semibold text-lg leading-relaxed">
            Buat akunmu sekarang dan rasakan pengalaman belajar yang belum pernah ada sebelumnya.
          </p>
          <div className="mt-12 text-6xl hidden md:block animate-bounce">🚀</div>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full md:w-7/12 bg-white px-8 py-12 md:px-16 md:py-28 flex items-center justify-center min-h-screen overflow-y-auto">
        <div className="w-full max-w-2xl">
          <h1 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Register Akun Baru</h1>
          <p className="text-slate-400 text-sm font-semibold mb-8">Silakan lengkapi formulir pendaftaran di bawah ini.</p>

          <div className="mb-6 bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-start gap-3">
            <span className="text-xl">📧</span>
            <p className="text-xs text-indigo-800 font-bold leading-relaxed text-left">
              Setelah mendaftar, sistem akan mengirimkan **link verifikasi ke email asli Anda**. Mohon periksa kotak masuk (inbox) atau folder spam untuk mengaktifkan akun.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Row 1: Nama & Peran */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input label="Full Name" placeholder="Budi Santoso" value={name} onChange={(e) => setName(e.target.value)} required />
              
              <div className="w-full flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700 ml-2">
                  Daftar Sebagai <span className="text-rose-500">*</span>
                </label>
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
            </div>

            {/* Row 2: Email & Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Input label="Email" type="email" placeholder="budi@sekolah.com" value={email} onChange={(e) => handleEmailChange(e.target.value)} error={emailError} required />
                <p className="text-[10px] text-slate-400 font-bold ml-2 mt-1.5 text-left">
                  ⚠️ Gunakan email asli yang aktif untuk verifikasi akun.
                </p>
              </div>

              <div>
                <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={(e) => handlePasswordChange(e.target.value)} error={passwordError} required />
                <p className="text-[10px] text-slate-400 font-bold ml-2 mt-1.5 text-left">
                  🔒 Password harus terdiri dari minimal 8 karakter.
                </p>
              </div>
            </div>

            {/* Row 3: Asal Sekolah & Kontak */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Asal Sekolah / Institusi"
                placeholder="SMA Negeri 1 Jakarta"
                value={schoolOrigin}
                onChange={(e) => setSchoolOrigin(e.target.value)}
                required
              />
              <Input
                label="Nomor HP / WhatsApp"
                type="tel"
                placeholder="08123456789"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>
            
            <p className="text-[10px] text-slate-400 font-bold ml-2 text-left -mt-2">
              📋 Asal sekolah dan nomor HP wajib diisi secara akurat untuk verifikasi oleh Admin Sekolah.
            </p>

            {/* Row 4: Jenjang Pendidikan */}
            {role === "TEACHER" && (
              <div className="w-full flex flex-col gap-3 p-5 bg-indigo-50/50 rounded-3xl border border-indigo-100/50 transition-all animate-in fade-in slide-in-from-top-2">
                <label className="text-xs font-black uppercase tracking-wider text-indigo-600 ml-2">
                  Pilih Jenjang Pendidikan (Bisa Lebih Dari Satu) <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {["SD", "SMP", "SMA", "UNIVERSITY"].map((level) => (
                    <label
                      key={level}
                      className={`flex items-center justify-center p-3 rounded-2xl border-2 cursor-pointer transition-all font-bold text-sm
                        ${educationLevels.includes(level)
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200"
                          : "bg-white border-slate-100 text-slate-500 hover:border-indigo-200"}`}
                    >
                      <input
                        type="checkbox"
                        name="educationLevels"
                        value={level}
                        className="hidden"
                        checked={educationLevels.includes(level)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEducationLevels((prev) => [...prev, level]);
                          } else {
                            setEducationLevels((prev) => prev.filter((l) => l !== level));
                          }
                        }}
                      />
                      {level}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {role === "STUDENT" && (
              <div className="w-full flex flex-col gap-3 p-5 bg-blue-50/50 rounded-3xl border border-blue-100/50 transition-all animate-in fade-in slide-in-from-top-2">
                <label className="text-xs font-black uppercase tracking-wider text-blue-600 ml-2">
                  Pilih Jenjang Pendidikanmu (Pilih Salah Satu) <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {["SD", "SMP", "SMA", "UNIVERSITY"].map((level) => (
                    <label
                      key={level}
                      className={`flex items-center justify-center p-3 rounded-2xl border-2 cursor-pointer transition-all font-bold text-sm
                        ${educationLevels.includes(level)
                          ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200"
                          : "bg-white border-slate-100 text-slate-500 hover:border-blue-200"}`}
                    >
                      <input
                        type="radio"
                        name="studentEducationLevel"
                        value={level}
                        className="hidden"
                        checked={educationLevels.includes(level)}
                        onChange={() => {
                          setEducationLevels([level]);
                        }}
                      />
                      {level}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <Button type="submit" isFullWidth disabled={isLoading} className="mt-8 shadow-xl shadow-indigo-100 py-4.5 text-base">
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
  );
}