import { useEffect, useState } from "react";
import socket from "../../hooks/useSocket";
import {
  getUsers,
  updateUser,
  deleteUser,
  approveUser,
} from "../services/user.service";
import type { User } from "../../types/user";
import { toast } from "react-hot-toast";
import { Check, X, Trash2, Search, Download, Eye } from "lucide-react";

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  async function loadUsers() {
    try {
      const response = await getUsers();
      const userData = Array.isArray(response) ? response : response.data;
      setUsers(userData);
      setFilteredUsers(userData);

      if (Array.isArray(userData)) {
        const count = userData.filter(
          (u: any) => u.approvalStatus === "PENDING"
        ).length;
        setPendingCount(count);
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengambil data user");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    socket.emit("join_admin_room");

    const handleRefresh = async () => {
      await loadUsers();
    };

    const handleNewTeacher = async (payload: { name?: string }) => {
      const name = payload?.name ? `"${payload.name}"` : "baru";
      toast(`👨‍🏫 Guru ${name} baru saja mendaftar dan menunggu persetujuan!`, {
        duration: 6000,
        style: {
          background: "#fef3c7",
          color: "#92400e",
          fontWeight: "800",
          borderRadius: "1rem",
          border: "1px solid #fcd34d",
        },
        icon: "🔔",
      });
      await loadUsers();
    };

    socket.on("admin_refresh", handleRefresh);
    socket.on("new_teacher_registered", handleNewTeacher);

    return () => {
      socket.off("admin_refresh", handleRefresh);
      socket.off("new_teacher_registered", handleNewTeacher);
    };
  }, []);

  useEffect(() => {
    let filtered = users.filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    if (statusFilter !== "ALL") {
      filtered = filtered.filter((u) => u.approvalStatus === statusFilter);
    }

    setFilteredUsers(filtered);
  }, [search, users, statusFilter]);

  async function handleApproval(id: string, action: "APPROVE" | "REJECT") {
    try {
      const updated = await approveUser(id, action);
      setUsers(users.map((u) => (u.id === id ? updated : u)));
      toast.success(`User berhasil di-${action.toLowerCase()}`);
    } catch (err: any) {
      toast.error(err.message || "Gagal mengubah status approval");
    }
  }

  async function changeRole(id: string, role: string) {
    try {
      const updated = await updateUser(id, { role });
      setUsers(users.map((u) => (u.id === id ? updated : u)));
      toast.success("Role user berhasil diperbarui");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal mengubah role");
    }
  }

  async function removeUser(id: string) {
    if (!confirm("Apakah Anda yakin ingin menghapus user ini?")) return;
    try {
      await deleteUser(id);
      setUsers(users.filter((u) => u.id !== id));
      toast.success("User berhasil dihapus");
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus user");
    }
  }

  const handleExportCSV = () => {
    const headers = [
      "Nama",
      "Email",
      "Role",
      "Jenjang Pendidikan",
      "Status Approval",
      "Jumlah Kuis Dibuat",
      "Poin XP Siswa",
      "Bio",
    ];
    const rows = filteredUsers.map((u: any) => [
      u.name,
      u.email,
      u.role,
      (u.educationLevels || []).join("; "),
      u.approvalStatus,
      u._count?.gamesCreated ?? 0,
      u.profile?.totalPoints ?? 0,
      u.profile?.bio || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `wordit-users-report-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Laporan pengguna berhasil diekspor ke CSV!");
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">
          Memuat Data User...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER & CONTROLS */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col xl:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2.5">
            Kelola Pengguna
            {pendingCount > 0 && (
              <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black px-2.5 py-0.5 rounded-full animate-pulse">
                {pendingCount} Menunggu Persetujuan
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-bold uppercase tracking-wider">
            Review status guru, verifikasi akun, dan kelola peran user
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-center w-full xl:w-auto">
          {/* Search Box */}
          <div className="relative flex items-center w-full sm:w-56">
            <input
              type="text"
              placeholder="Cari nama atau email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-50 border border-slate-200 px-4 py-2 pl-9 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all w-full"
            />
            <Search size={14} className="absolute left-3 text-slate-400" />
          </div>

          {/* Status Tabs Filter */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 w-full sm:w-auto overflow-x-auto shrink-0">
            {["ALL", "PENDING", "APPROVED", "REJECTED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all shrink-0 uppercase tracking-wider ${
                  statusFilter === st
                    ? "bg-white text-indigo-600 shadow-sm font-black"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {st}
                {st === "PENDING" && pendingCount > 0 ? ` (${pendingCount})` : ""}
              </button>
            ))}
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-100 rounded-xl text-xs font-black transition-all shrink-0 w-full sm:w-auto justify-center"
            title="Ekspor Laporan CSV"
          >
            <Download size={14} />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* TABLE LIST */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px] border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-slate-400 font-black uppercase text-[10px] tracking-widest">
                <th className="py-4.5 px-6">Pengguna</th>
                <th className="py-4.5 px-4">Jenjang Pendidikan</th>
                <th className="py-4.5 px-4">Status Approval</th>
                <th className="py-4.5 px-4 text-center">Role / Hak Akses</th>
                <th className="py-4.5 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 font-bold">
                    Tidak ada pengguna ditemukan.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="group hover:bg-slate-50/40 transition-colors">
                    {/* User Info */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center font-black text-indigo-600 text-sm uppercase shrink-0">
                          {u.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 text-sm truncate leading-snug">
                            {u.name}
                          </p>
                          <p className="text-slate-400 font-bold text-xs truncate">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Education Levels */}
                    <td className="py-4 px-4">
                      {u.educationLevels && u.educationLevels.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {u.educationLevels.map((lvl: string) => (
                            <span
                              key={lvl}
                              className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-md text-[9px] font-black border border-blue-100"
                            >
                              {lvl}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-300 italic text-[10px]">
                          Tidak ditentukan
                        </span>
                      )}
                    </td>

                    {/* Approval Status Badge */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black border ${
                          u.approvalStatus === "APPROVED"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : u.approvalStatus === "PENDING"
                            ? "bg-amber-50 text-amber-600 border-amber-100 animate-pulse"
                            : "bg-rose-50 text-rose-600 border-rose-100"
                        }`}
                      >
                        <span
                          className={`w-1 h-1 rounded-full ${
                            u.approvalStatus === "APPROVED"
                              ? "bg-emerald-500"
                              : u.approvalStatus === "PENDING"
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          }`}
                        />
                        {u.approvalStatus}
                      </span>
                    </td>

                    {/* Role Dropdown */}
                    <td className="py-4 px-4 text-center">
                      <select
                        value={u.role}
                        onChange={(e) => changeRole(u.id, e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg font-bold text-[10px] outline-none hover:border-indigo-500 cursor-pointer"
                      >
                        <option value="STUDENT">🎓 STUDENT</option>
                        <option value="TEACHER">👨‍🏫 TEACHER</option>
                        <option value="ADMIN">🛡️ ADMIN</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end items-center gap-2">
                        {/* Approval buttons for Pending Teachers */}
                        {u.role === "TEACHER" && u.approvalStatus === "PENDING" && (
                          <div className="flex items-center gap-1 border-r border-slate-100 pr-2 mr-1">
                            <button
                              onClick={() => handleApproval(u.id, "APPROVE")}
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white rounded-lg transition-colors border border-emerald-100"
                              title="Setujui Pendaftaran Guru"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => handleApproval(u.id, "REJECT")}
                              className="p-1.5 bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white rounded-lg transition-colors border border-rose-100"
                              title="Tolak Pendaftaran Guru"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        )}

                        {/* View details */}
                        <button
                          onClick={() => setSelectedUser(u)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                          title="Lihat Detail Pengguna"
                        >
                          <Eye size={16} />
                        </button>

                        {/* Delete User */}
                        <button
                          onClick={() => removeUser(u.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                          title="Hapus Pengguna"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── DETAIL USER MODAL ─── */}
      {selectedUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative border border-slate-100 animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition"
            >
              <X size={20} />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-4 border-b border-slate-100 pb-5 mb-5">
              <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center font-black text-indigo-600 text-2xl uppercase shrink-0">
                {selectedUser.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-md text-[9px] font-black uppercase tracking-wider">
                  {selectedUser.role}
                </span>
                <h3 className="text-xl font-black text-slate-800 mt-1 truncate">
                  {selectedUser.name}
                </h3>
                <p className="text-slate-400 text-xs font-bold truncate">{selectedUser.email}</p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 text-slate-600">
              {/* Bio */}
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                  Bio / Deskripsi
                </h4>
                <p className="text-sm font-semibold text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 min-h-[60px] whitespace-pre-wrap">
                  {selectedUser.profile?.bio || "Pengguna belum menulis bio."}
                </p>
              </div>

              {/* Education Levels */}
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                  Jenjang Pendidikan
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedUser.educationLevels && selectedUser.educationLevels.length > 0 ? (
                    selectedUser.educationLevels.map((lvl: string) => (
                      <span
                        key={lvl}
                        className="bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-lg text-xs font-black"
                      >
                        {lvl}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 text-xs font-bold italic">
                      Tidak ditentukan
                    </span>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                    {selectedUser.role === "TEACHER"
                      ? "Kuis Dibuat"
                      : selectedUser.role === "STUDENT"
                      ? "Total Poin XP"
                      : "Status Akun"}
                  </span>
                  <span className="text-lg font-black text-slate-800 mt-1 block">
                    {selectedUser.role === "TEACHER"
                      ? `${selectedUser._count?.gamesCreated ?? 0} game`
                      : selectedUser.role === "STUDENT"
                      ? `${selectedUser.profile?.totalPoints ?? 0} XP`
                      : "Administrator"}
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                    Tanggal Terdaftar
                  </span>
                  <span className="text-xs font-bold text-slate-700 mt-2 block">
                    {new Date(selectedUser.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="mt-6 pt-5 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
