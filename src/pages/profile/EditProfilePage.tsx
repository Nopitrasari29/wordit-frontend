import { useState } from "react"
import { useAuth } from "../../hooks/useAuth"
import { getImageUrl } from "../../utils/assets"
import Input from "../../components/ui/Input"
import { updateProfile } from "../../pages/services/user.service"

export default function EditProfilePage() {
  const { user, updateUser } = useAuth()

  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [bio, setBio] = useState(user?.profile?.bio || "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [photo, setPhoto] = useState<File | null>(null)
  const [educationLevels, setEducationLevels] = useState<string[]>(user?.educationLevels || [])

  const [preview, setPreview] = useState(getImageUrl(user?.photoUrl))
  const [saving, setSaving] = useState(false)

  function handlePhoto(e: any) {
    const file = e.target.files[0]
    if (!file) return
    setPhoto(file)
    setPreview(URL.createObjectURL(file))
  }

  async function submit(e: any) {
    e.preventDefault()
    try {
      setSaving(true)
      
      const updatedData = await updateProfile({
        name,
        email,
        bio,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
        photo: photo || undefined,
        educationLevels: user?.role === "TEACHER" ? educationLevels : undefined,
      })

      updateUser(updatedData)
      alert("Profile updated successfully!")
      window.location.href = "/profile"
    } catch (err: any) {
      alert(err.message || "Update failed")
    } finally {
      setSaving(false)
    }
  }

  return (
    // bg-white/gradient agar background penuh ke pinggir layar
    <div className="min-h-screen bg-white py-12 px-6 font-sans relative overflow-hidden pt-28 selection:bg-indigo-100 selection:text-indigo-900">

      {/* Dekorasi Background Blob Lembut (Sinkron dengan ProfilePage) */}
      <div className="absolute top-20 -left-10 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-60 animate-blob"></div>
      <div className="absolute bottom-10 -right-10 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-60 animate-blob" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-2xl mx-auto relative z-10">
        <h1 className="text-3xl font-black text-slate-800 mb-8 tracking-tight">Edit Profile ⚙️</h1>

        <form onSubmit={submit} className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">

          {/* Avatar Upload Section (Sinkron dengan ProfilePage) */}
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="relative group cursor-pointer">
              <img
                src={preview}
                className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-indigo-50 shadow-md group-hover:opacity-80 transition-all bg-slate-50"
                alt="Preview"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="bg-black/40 text-white text-xs px-3 py-1 rounded-full font-bold">Ubah Photo</span>
              </div>
              <input
                type="file"
                onChange={handlePhoto}
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept="image/*"
              />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Profile Picture</p>
          </div>

          <div className="space-y-4">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              required
            />

            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-600">Bio Description</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tulis bio singkat Anda di sini..."
                maxLength={250}
                className="w-full border border-slate-200 px-6 py-4 rounded-3xl text-slate-700 focus:border-indigo-500 focus:bg-white outline-none transition-all resize-none h-32 text-sm font-medium"
              />
              <span className="text-[10px] text-right font-bold text-slate-400 uppercase tracking-widest">
                {bio.length}/250 Karakter
              </span>
            </div>


            {/* Jenjang Pendidikan — hanya tampil untuk TEACHER */}
            {user?.role === "TEACHER" && (
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">Jenjang Pendidikan</p>
                <div className="grid grid-cols-2 gap-3">
                  {["SD", "SMP", "SMA", "UNIVERSITY"].map((level) => (
                    <label
                      key={level}
                      className={`flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                        educationLevels.includes(level)
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={educationLevels.includes(level)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEducationLevels([...educationLevels, level]);
                          } else {
                            setEducationLevels(educationLevels.filter((l) => l !== level));
                          }
                        }}
                        className="w-4 h-4 accent-indigo-600"
                      />
                      <span className={`text-sm font-bold ${educationLevels.includes(level) ? "text-indigo-700" : "text-slate-600"}`}>
                        {level === "SD" ? "🧒 SD" : level === "SMP" ? "📘 SMP" : level === "SMA" ? "🎒 SMA" : "🎓 University"}
                      </span>
                    </label>
                  ))}
                </div>
                {educationLevels.length === 0 && (
                  <p className="text-xs text-rose-500 font-bold mt-2">⚠️ Pilih minimal 1 jenjang pendidikan</p>
                )}
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 mt-6">
              <p className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">Ubah Password</p>
              <div className="space-y-4">
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Current Password (Optional)"
                />
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password (Optional)"
                />
              </div>
            </div>
          </div>


          <button
            type="submit"
            disabled={saving}
            className="w-full bg-indigo-600 text-white font-black text-lg py-4 rounded-full shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0 mt-6 active:scale-95"
          >
            {saving ? "Saving Changes..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  )
}