import api from "./api";

/* ============================== */
/* UPDATE PROFILE (SELF USER)     */
/* ============================== */

export async function updateProfile(data: {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  photo?: File;
  bio?: string;
  // 🛠️ FIX TYPE: Tambahkan properti array jenjang pendidikan mengajar guru disini
  educationLevels?: string[]; 
}) {
  const formData = new FormData();

  if (data.name) formData.append("name", data.name);
  if (data.email) formData.append("email", data.email);
  if (data.bio !== undefined) formData.append("bio", data.bio);
  if (data.currentPassword) formData.append("currentPassword", data.currentPassword);
  if (data.newPassword) formData.append("newPassword", data.newPassword);
  if (data.photo) formData.append("profile_picture", data.photo);
  
  // 🛠️ SINKRONISASI PAYLOAD FORMDATA: Ubah array menjadi JSON string agar aman dikirim ke backend Express
  if (data.educationLevels) {
    formData.append("educationLevels", JSON.stringify(data.educationLevels));
  }

  const res = await api.patch("/users/profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  if (res.data.status !== "success" && !res.data.success) {
    throw new Error(res.data.message || "Failed to update profile");
  }

  return res.data.data;
}

/* ============================== */
/* ADMIN GET USERS                */
/* ============================== */

export async function getUsers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  approvalStatus?: string;
  role?: string;
}) {
  const res = await api.get("/users", { params });
  if (res.data.status !== "success" && !res.data.success) {
    throw new Error(res.data.message || "Failed to fetch users");
  }
  // Backend returns { data: [...], meta: {...} } when paginated
  return res.data.data;
}

/* ============================== */
/* ADMIN APPROVE/REJECT USER      */
/* ============================== */
export async function approveUser(id: string, action: "APPROVE" | "REJECT") {
  const res = await api.patch(`/users/${id}/approve`, { action });
  if (res.data.status !== "success" && !res.data.success) {
    throw new Error(res.data.message || "Gagal memproses approval");
  }
  return res.data.data;
}

/* ============================== */
/* ADMIN UPDATE USER              */
/* ============================== */

export async function updateUser(id: string, data: any) {
  const res = await api.patch(`/users/${id}/role`, data);
  if (res.data.status !== "success" && !res.data.success) {
    throw new Error(res.data.message || "Failed to update user");
  }
  return res.data.data;
}

/* ============================== */
/* ADMIN DELETE USER              */
/* ============================== */

export async function deleteUser(id: string) {
  const res = await api.delete(`/users/${id}`);
  if (res.data.status !== "success" && !res.data.success) {
    throw new Error(res.data.message || "Failed to delete user");
  }
  return res.data.data;
}

/* ============================== */
/* GET STUDENT LEADERBOARD        */
/* ============================== */
export async function getStudentLeaderboard() {
  const res = await api.get("/users/leaderboard");
  if (res.data.status !== "success" && !res.data.success) {
    throw new Error(res.data.message || "Failed to fetch student leaderboard");
  }
  return res.data.data;
}

/* ============================== */
/* ADMIN BULK IMPORT USERS        */
/* ============================== */
export async function bulkImportUsers(users: any[]) {
  const res = await api.post("/users/bulk-import", { users });
  if (res.data.status !== "success" && !res.data.success) {
    throw new Error(res.data.message || "Failed to bulk import users");
  }
  return res.data.data;
}

/* ============================== */
/* ADMIN BULK DELETE USERS        */
/* ============================== */
export async function bulkDeleteUsers(userIds: string[]) {
  const res = await api.delete("/users/bulk-delete", { data: { userIds } });
  if (res.data.status !== "success" && !res.data.success) {
    throw new Error(res.data.message || "Failed to bulk delete users");
  }
  return res.data.data;
}

/* ============================== */
/* REQUEST SCHOOL ADMIN           */
/* ============================== */
export async function requestSchoolAdmin() {
  const res = await api.patch("/users/request-school-admin");
  if (res.data.status !== "success" && !res.data.success) {
    throw new Error(res.data.message || "Gagal mengajukan Admin Sekolah");
  }
  return res.data.data;
}

/* ============================== */
/* APPROVE/REJECT SCHOOL ADMIN    */
/* ============================== */
export async function approveSchoolAdmin(id: string, action: "APPROVE" | "REJECT") {
  const res = await api.patch(`/users/${id}/approve-school-admin`, { action });
  if (res.data.status !== "success" && !res.data.success) {
    throw new Error(res.data.message || "Gagal memproses pengajuan Admin Sekolah");
  }
  return res.data.data;
}

export async function cancelSchoolAdmin() {
  const res = await api.patch("/users/cancel-school-admin");
  if (res.data.status !== "success" && !res.data.success) {
    throw new Error(res.data.message || "Gagal membatalkan status Admin Sekolah");
  }
  return res.data.data;
}