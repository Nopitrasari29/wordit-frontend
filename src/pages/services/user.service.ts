import api from "./api";

/* ============================== */
/* UPDATE PROFILE (SELF USER) */
/* ============================== */

export async function updateProfile(data: {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  photo?: File;
  bio?: string;
}) {
  const formData = new FormData();

  if (data.name) formData.append("name", data.name);
  if (data.email) formData.append("email", data.email);
  if (data.bio !== undefined) formData.append("bio", data.bio);
  if (data.currentPassword) formData.append("currentPassword", data.currentPassword);
  if (data.newPassword) formData.append("newPassword", data.newPassword);
  if (data.photo) formData.append("profile_picture", data.photo);

  const res = await api.patch("/users/profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  if (res.data.status !== "success" && !res.data.success) {
    throw new Error(res.data.message || "Failed to update profile");
  }

  return res.data.data;
}

/* ============================== */
/* ADMIN GET USERS */
/* ============================== */

export async function getUsers() {
  const res = await api.get("/users");
  if (res.data.status !== "success" && !res.data.success) {
    throw new Error(res.data.message || "Failed to fetch users");
  }
  return res.data.data;
}

/* ============================== */
/* ADMIN APPROVE/REJECT USER */
/* ============================== */
export async function approveUser(id: string, action: "APPROVE" | "REJECT") {
  const res = await api.patch(`/users/${id}/approve`, { action });
  if (res.data.status !== "success" && !res.data.success) {
    throw new Error(res.data.message || "Gagal memproses approval");
  }
  return res.data.data;
}

/* ============================== */
/* ADMIN UPDATE USER */
/* ============================== */

export async function updateUser(id: string, data: any) {
  const res = await api.patch(`/users/${id}/role`, data);
  if (res.data.status !== "success" && !res.data.success) {
    throw new Error(res.data.message || "Failed to update user");
  }
  return res.data.data;
}

/* ============================== */
/* ADMIN DELETE USER */
/* ============================== */

export async function deleteUser(id: string) {
  const res = await api.delete(`/users/${id}`);
  if (res.data.status !== "success" && !res.data.success) {
    throw new Error(res.data.message || "Failed to delete user");
  }
  return res.data.data;
}

/* ============================== */
/* GET STUDENT LEADERBOARD */
/* ============================== */
export async function getStudentLeaderboard() {
  const res = await api.get("/users/leaderboard");
  if (res.data.status !== "success" && !res.data.success) {
    throw new Error(res.data.message || "Failed to fetch student leaderboard");
  }
  return res.data.data;
}