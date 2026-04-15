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
    <div className="min-h-screen bg-slate-50 py-12 px-6 font-sans">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-black text-slate-800 mb-8 tracking-tight">Edit Profile ⚙️</h1>

        <form onSubmit={submit} className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">

          {/* Avatar Upload Section */}
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="relative group cursor-pointer">
              <img
                src={preview || "/avatar.png"}
                className="w-32 h-32 rounded-full object-cover border-4 border-indigo-50 shadow-md group-hover:opacity-80 transition-all"
                alt="Preview"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="bg-black/40 text-white text-xs px-3 py-1 rounded-full font-bold">Ubah</span>
              </div>
              <input
                type="file"
                onChange={handlePhoto}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Profile Picture</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-slate-700 ml-4 mb-1 block">Full Name</label>
              <input
                className="w-full bg-slate-50 border-2 border-slate-100 px-6 py-3.5 rounded-full focus:border-indigo-500 focus:bg-white outline-none transition-all font-semibold"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700 ml-4 mb-1 block">Email Address</label>
              <input
                className="w-full bg-slate-50 border-2 border-slate-100 px-6 py-3.5 rounded-full focus:border-indigo-500 focus:bg-white outline-none transition-all font-semibold"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 mt-6">
              <p className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">Ubah Password</p>
              <div className="space-y-4">
                <input
                  type="password"
                  className="w-full bg-slate-50 border-2 border-slate-100 px-6 py-3.5 rounded-full focus:border-indigo-500 focus:bg-white outline-none transition-all font-semibold"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Current Password"
                />
                <input
                  type="password"
                  className="w-full bg-slate-50 border-2 border-slate-100 px-6 py-3.5 rounded-full focus:border-indigo-500 focus:bg-white outline-none transition-all font-semibold"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password"
                />
              </div>
            </div>
          </div>

          <button
            disabled={saving}
            className="w-full bg-indigo-600 text-white font-black text-lg py-4 rounded-full shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0 mt-6"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  )
}