import { useState } from "react"
import { useAuth } from "../../hooks/useAuth"

export default function EditProfilePage() {
  const { user } = useAuth()

  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [photo, setPhoto] = useState<File | null>(null)

  const [preview, setPreview] = useState(user?.photoUrl || "")
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
      const token = localStorage.getItem("token")
      const formData = new FormData()

      formData.append("name", name)
      formData.append("email", email)
      if (currentPassword) formData.append("currentPassword", currentPassword)
      if (newPassword) formData.append("newPassword", newPassword)
      if (photo) formData.append("profile_picture", photo)

      // Ganti URL API Anda di sini
      const res = await fetch("http://localhost:3000/api/users/profile", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.message || "Failed to update profile")

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
                src={preview || "/avatar.png"}
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
            <div>
              <label className="text-sm font-bold text-slate-700 ml-4 mb-1 block">Full Name</label>
              <input
                className="w-full bg-slate-50 border-2 border-slate-100 px-6 py-3.5 rounded-full focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all font-semibold"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                required
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700 ml-4 mb-1 block">Email Address</label>
              <input
                type="email"
                className="w-full bg-slate-50 border-2 border-slate-100 px-6 py-3.5 rounded-full focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all font-semibold"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
              />
            </div>

            <div className="pt-4 border-t border-slate-100 mt-6">
              <p className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">Ubah Password</p>
              <div className="space-y-4">
                <input
                  type="password"
                  className="w-full bg-slate-50 border-2 border-slate-100 px-6 py-3.5 rounded-full focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all font-semibold"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Current Password (Optional)"
                />
                <input
                  type="password"
                  className="w-full bg-slate-50 border-2 border-slate-100 px-6 py-3.5 rounded-full focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all font-semibold"
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
            className="w-full bg-indigo-600 text-white font-black text-lg py-4 rounded-full shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0 mt-6 shadow-indigo-200 active:scale-95"
          >
            {saving ? "Saving Changes..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  )
}