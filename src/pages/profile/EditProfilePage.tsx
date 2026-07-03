import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"
import { getImageUrl } from "../../utils/assets"
import Input from "../../components/ui/Input"
import { updateProfile } from "../../pages/services/user.service"
import { toast } from "react-hot-toast"
import { ArrowLeft, User, Image, GraduationCap, Lock, Camera, Save, Key } from "lucide-react"

type Section = "info" | "photo" | "education" | "security"

export default function EditProfilePage() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()

  const [activeSection, setActiveSection] = useState<Section>("info")

  // Section: Info Pribadi
  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [phoneNumber, setPhoneNumber] = useState((user as any)?.phoneNumber || "")
  const [schoolOrigin, setSchoolOrigin] = useState((user as any)?.schoolOrigin || "")

  // Section: Foto & Bio
  const [bio, setBio] = useState(user?.profile?.bio || "")
  const [photo, setPhoto] = useState<File | null>(null)
  const [preview, setPreview] = useState(getImageUrl(user?.photoUrl))

  // Section: Jenjang (Teacher)
  const [educationLevels, setEducationLevels] = useState<string[]>(user?.educationLevels || [])

  // Section: Keamanan
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [saving, setSaving] = useState(false)

  function handlePhoto(e: any) {
    const file = e.target.files[0]
    if (!file) return
    setPhoto(file)
    setPreview(URL.createObjectURL(file))
  }

  async function submit(e: any) {
    e.preventDefault()
    if (activeSection === "security") {
      if (!currentPassword) return toast.error("Masukkan password saat ini!")
      if (newPassword.length < 8) return toast.error("Password baru minimal 8 karakter!")
      if (newPassword !== confirmPassword) return toast.error("Password baru dan konfirmasi tidak cocok!")
    }
    try {
      setSaving(true)
      const updatedData = await updateProfile({
        name, email, bio,
        phoneNumber: phoneNumber || undefined,
        schoolOrigin: schoolOrigin || undefined,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
        photo: photo || undefined,
        educationLevels: user?.role === "TEACHER" ? educationLevels : undefined,
      })

      const isLevelsChanged = user?.role === "TEACHER" && (
        educationLevels.length !== (user?.educationLevels || []).length ||
        !educationLevels.every((l) => (user?.educationLevels || []).includes(l))
      )

      if (updatedData?.approvalStatus === "PENDING") {
        updatedData.educationLevels = user?.educationLevels || []
      }

      updateUser(updatedData)

      if (isLevelsChanged) {
        toast.success("Pengajuan perubahan jenjang berhasil dikirim ke Admin! (2-3 hari kerja)")
      } else {
        toast.success("Pengaturan berhasil disimpan!")
      }
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); setPhoto(null)
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan pengaturan")
    } finally {
      setSaving(false)
    }
  }

  const navItems: { id: Section; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: "info",      label: "Informasi Pribadi", icon: <User size={18} />,          desc: "Nama, email, HP, sekolah" },
    { id: "photo",     label: "Foto & Bio",         icon: <Image size={18} />,         desc: "Foto profil dan deskripsi" },
    ...(user?.role === "TEACHER" || user?.role === "SCHOOL_ADMIN"
      ? [{ id: "education" as Section, label: "Jenjang Mengajar", icon: <GraduationCap size={18} />, desc: "Level kelas yang Anda ajar" }]
      : []),
    { id: "security",  label: "Keamanan Akun",      icon: <Lock size={18} />,          desc: "Ubah password akun" },
  ]

  return (
    <div className="min-h-screen bg-slate-50 font-sans pt-28 pb-20 selection:bg-indigo-100 selection:text-indigo-900">
      <div className="fixed top-20 -left-20 w-96 h-96 bg-indigo-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-20 -right-20 w-96 h-96 bg-violet-100/50 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate("/profile")}
            className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-all shadow-sm"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Pengaturan Akun</h1>
            <p className="text-sm text-slate-500 font-medium">Kelola informasi pribadi dan keamanan akun Anda</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
          {/* Sidebar */}
          <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-all shrink-0 w-full group ${
                  activeSection === item.id
                    ? "bg-white shadow-md border border-indigo-100"
                    : "hover:bg-white/60"
                }`}
              >
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                  activeSection === item.id
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                    : "bg-slate-100 text-slate-500 group-hover:bg-indigo-50"
                }`}>
                  {item.icon}
                </span>
                <span className="hidden md:block min-w-0">
                  <span className={`block text-sm font-black truncate ${activeSection === item.id ? "text-indigo-700" : "text-slate-700"}`}>
                    {item.label}
                  </span>
                  <span className="block text-[11px] font-medium text-slate-400">{item.desc}</span>
                </span>
              </button>
            ))}
          </nav>

          {/* Content */}
          <form onSubmit={submit} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8 space-y-6 min-h-[420px]">

            {/* -- INFORMASI PRIBADI -- */}
            {activeSection === "info" && (
              <div className="space-y-5">
                <div className="pb-4 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <User size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-800">Informasi Pribadi</h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Perubahan email mungkin memerlukan verifikasi ulang.</p>
                  </div>
                </div>
                <Input label="Nama Lengkap" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama lengkap Anda" required />
                <Input label="Alamat Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@contoh.com" required />
                <div>
                  <Input label="Nomor HP / WhatsApp (Opsional)" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="Contoh: 08123456789" />
                  <p className="text-[11px] text-slate-400 font-medium mt-1.5 ml-1">Untuk komunikasi darurat dan verifikasi oleh Admin.</p>
                </div>
                <Input label="Asal Sekolah / Institusi" value={schoolOrigin} onChange={(e) => setSchoolOrigin(e.target.value)} placeholder="Contoh: SMAN 1 Surabaya" />
                <button type="submit" disabled={saving} className="w-full bg-indigo-600 text-white font-black text-base py-3.5 rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2">
                  <Save size={16} />
                  {saving ? "Menyimpan..." : "Simpan Informasi Pribadi"}
                </button>
              </div>
            )}

            {/* -- FOTO & BIO -- */}
            {activeSection === "photo" && (
              <div className="space-y-5">
                <div className="pb-4 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
                    <Image size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-800">Foto Profil & Bio</h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Foto ditampilkan di seluruh platform WordIT.</p>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-4">
                  <div className="relative group cursor-pointer">
                    <img
                      src={preview}
                      className="w-32 h-32 rounded-full object-cover border-4 border-indigo-50 shadow-lg group-hover:opacity-75 transition-all bg-slate-100"
                      alt="Foto Profil"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full bg-black/40">
                      <div className="flex flex-col items-center gap-1 text-white">
                        <Camera size={20} />
                        <span className="text-[10px] font-black uppercase tracking-wide">Ubah</span>
                      </div>
                    </div>
                    <input type="file" onChange={handlePhoto} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                  </div>
                  {photo
                    ? <p className="text-xs text-emerald-600 font-bold flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                          <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
                        </span>
                        Foto baru siap diunggah: {photo.name}
                      </p>
                    : <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest">Klik foto untuk mengganti</p>
                  }
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-black text-slate-700">Bio / Deskripsi Diri</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tulis bio singkat Anda di sini... (opsional)"
                    maxLength={250}
                    className="w-full border border-slate-200 px-5 py-4 rounded-2xl text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-none h-32 text-sm font-medium"
                  />
                  <span className="text-[11px] text-right font-bold text-slate-400">{bio.length}/250 karakter</span>
                </div>
                <button type="submit" disabled={saving} className="w-full bg-violet-600 text-white font-black text-base py-3.5 rounded-2xl shadow-lg shadow-violet-200 hover:bg-violet-700 hover:-translate-y-0.5 transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2">
                  <Save size={16} />
                  {saving ? "Menyimpan..." : "Simpan Foto & Bio"}
                </button>
              </div>
            )}

            {/* -- JENJANG MENGAJAR -- */}
            {activeSection === "education" && (user?.role === "TEACHER" || user?.role === "SCHOOL_ADMIN") && (
              <div className="space-y-5">
                <div className="pb-4 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                    <GraduationCap size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-800">Jenjang Mengajar</h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Perubahan jenjang memerlukan persetujuan Admin (2-3 hari kerja).</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {["SD", "SMP", "SMA", "UNIVERSITY"].map((level) => {
                    const isChecked = educationLevels.includes(level)
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => {
                          if (isChecked) {
                            if (educationLevels.length > 1) setEducationLevels(educationLevels.filter((l) => l !== level))
                            else toast.error("Minimal harus memilih satu jenjang!")
                          } else {
                            setEducationLevels([...educationLevels, level])
                          }
                        }}
                        className={`px-6 py-3 rounded-2xl text-sm font-black transition-all border ${
                          isChecked
                            ? "bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-100 scale-105"
                            : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600"
                        }`}
                      >
                        {level === "SD" ? "SD" : level === "SMP" ? "SMP" : level === "SMA" ? "SMA" : "Universitas"}
                      </button>
                    )
                  })}
                </div>
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
                  <p className="text-xs font-black text-amber-800 uppercase tracking-wide mb-1">Catatan Penting</p>
                  <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                    Mengubah jenjang akan mengirimkan permohonan ke Admin WordIT. Status akun ditinjau ulang dalam <strong>maksimal 2-3 hari kerja</strong>.
                  </p>
                </div>
                <button type="submit" disabled={saving} className="w-full bg-amber-500 text-white font-black text-base py-3.5 rounded-2xl shadow-lg shadow-amber-100 hover:bg-amber-600 hover:-translate-y-0.5 transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2">
                  <GraduationCap size={16} />
                  {saving ? "Mengajukan..." : "Ajukan Perubahan Jenjang"}
                </button>
              </div>
            )}

            {/* -- KEAMANAN -- */}
            {activeSection === "security" && (
              <div className="space-y-5">
                <div className="pb-4 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                    <Lock size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-800">Keamanan Akun</h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Gunakan password yang kuat dan unik.</p>
                  </div>
                </div>
                <Input type="password" label="Password Saat Ini" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Masukkan password lama Anda" />
                <Input type="password" label="Password Baru" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimal 8 karakter" />
                <Input type="password" label="Konfirmasi Password Baru" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Ulangi password baru" />
                {newPassword && confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-rose-500 font-bold">Password baru dan konfirmasi tidak cocok</p>
                )}
                {newPassword.length >= 8 && newPassword === confirmPassword && (
                  <p className="text-xs text-emerald-600 font-bold">Password valid dan cocok</p>
                )}
                <button
                  type="submit"
                  disabled={saving || !currentPassword || !newPassword || newPassword !== confirmPassword}
                  className="w-full bg-slate-900 text-white font-black text-base py-3.5 rounded-2xl shadow-lg shadow-slate-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center gap-2"
                >
                  <Key size={16} />
                  {saving ? "Memperbarui..." : "Perbarui Password"}
                </button>
              </div>
            )}

          </form>
        </div>
      </div>
    </div>
  )
}
