import { useState } from "react"
import { useAuth } from "../../hooks/useAuth"

const API_URL = "http://localhost:3000/api"

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

      if (currentPassword)
        formData.append("currentPassword", currentPassword)

      if (newPassword)
        formData.append("newPassword", newPassword)

      if (photo)
        formData.append("profile_picture", photo)

    const res = await fetch("http://localhost:3000/api/users/profile", {
    method: "PATCH",
    headers: {
        Authorization: `Bearer ${token}`
    },
    body: formData
    })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.message || "Failed to update profile")
      }

      alert("Profile updated successfully!")

      window.location.href = "/profile"

    } catch (err: any) {

      alert(err.message || "Update failed")

    } finally {

      setSaving(false)

    }

  }

  return (

    <div className="max-w-xl mx-auto space-y-6">

      <h1 className="text-2xl font-bold">
        Edit Profile
      </h1>

      <form onSubmit={submit} className="space-y-4">

        <div className="flex flex-col items-center gap-4">

          <img
            src={preview || "/avatar.png"}
            className="w-28 h-28 rounded-full object-cover"
          />

          <input
            type="file"
            onChange={handlePhoto}
          />

        </div>

        <input
          className="border p-3 rounded w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
        />

        <input
          className="border p-3 rounded w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />

        <input
          type="password"
          className="border p-3 rounded w-full"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Current Password"
        />

        <input
          type="password"
          className="border p-3 rounded w-full"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New Password"
        />

        <button
          disabled={saving}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg w-full"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

      </form>

    </div>

  )

}