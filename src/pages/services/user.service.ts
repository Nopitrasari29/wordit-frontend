const API_URL = "http://localhost:3000/api"

/* ============================== */
/* GET TOKEN */
/* ============================== */

function getToken() {
  return localStorage.getItem("token")
}

/* ============================== */
/* UPDATE PROFILE (SELF USER) */
/* ============================== */

export async function updateProfile(data: {
  name?: string
  email?: string
  currentPassword?: string
  newPassword?: string
  photo?: File
}) {

  const token = getToken()

  const formData = new FormData()

  if (data.name) formData.append("name", data.name)
  if (data.email) formData.append("email", data.email)

  if (data.currentPassword)
    formData.append("currentPassword", data.currentPassword)

  if (data.newPassword)
    formData.append("newPassword", data.newPassword)

  if (data.photo)
    formData.append("profile_picture", data.photo)

  const res = await fetch(`${API_URL}/users/profile`, {
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

  return json.data
}

/* ============================== */
/* ADMIN GET USERS */
/* ============================== */

export async function getUsers() {

  const token = getToken()

  const res = await fetch(`${API_URL}/users`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  const json = await res.json()

  if (!res.ok) {
    throw new Error(json.message || "Failed to fetch users")
  }

  return json.data
}

/* ============================== */
/* ADMIN APPROVE/REJECT USER (Sprint 2 - BE-NEW-02) */
/* ============================== */
export async function approveUser(id: string, action: "APPROVE" | "REJECT") {
  const token = getToken()

  const res = await fetch(`${API_URL}/users/${id}/approve`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ action }) // Mengirim action sesuai kontrak backend
  })

  const json = await res.json()

  if (!res.ok) {
    throw new Error(json.message || "Gagal memproses approval")
  }

  return json.data
}

/* ============================== */
/* ADMIN UPDATE USER */
/* ============================== */

export async function updateUser(id: string, data: any) {

  const token = getToken()

  const res = await fetch(`${API_URL}/users/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  })

  const json = await res.json()

  if (!res.ok) {
    throw new Error(json.message || "Failed to update user")
  }

  return json.data
}

/* ============================== */
/* ADMIN DELETE USER */
/* ============================== */

export async function deleteUser(id: string) {

  const token = getToken()

  const res = await fetch(`${API_URL}/users/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  const json = await res.json()

  if (!res.ok) {
    throw new Error(json.message || "Failed to delete user")
  }

  return json.data
}