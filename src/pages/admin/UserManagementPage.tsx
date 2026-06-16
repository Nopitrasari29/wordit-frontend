import { useEffect, useState } from "react";
import socket from "../../hooks/useSocket";
import {
  getUsers,
  updateUser,
  deleteUser,
  approveUser,
  bulkImportUsers,
} from "../services/user.service";
import type { User } from "../../types/user";
import { toast } from "react-hot-toast";
import { Check, X, Trash2, Search, Download, Eye, Upload, RefreshCw } from "lucide-react";
import ConfirmModal from "../../components/ui/ConfirmModal";

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // States for CSV Bulk Import
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importUsers, setImportUsers] = useState<any[]>([]);
  const [importResults, setImportResults] = useState<{
    total: number;
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmConfig({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        closeConfirm();
      },
    });
  };

  const closeConfirm = () => {
    setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
  };

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

  function removeUser(id: string) {
    showConfirm(
      "Hapus Pengguna",
      "Apakah Anda yakin ingin menghapus user ini secara permanen?",
      async () => {
        try {
          await deleteUser(id);
          setUsers(users.filter((u) => u.id !== id));
          toast.success("User berhasil dihapus");
        } catch (err) {
          console.error(err);
          toast.error("Gagal menghapus user");
        }
      }
    );
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

  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    
    const nameIdx = headers.findIndex((h) => h.includes("nama") || h.includes("name"));
    const emailIdx = headers.findIndex((h) => h.includes("email") || h.includes("surel") || h.includes("pos"));
    const passIdx = headers.findIndex((h) => h.includes("pass") || h.includes("sandi"));
    const roleIdx = headers.findIndex((h) => h.includes("role") || h.includes("peran"));
    const jenjangIdx = headers.findIndex((h) => h.includes("jenjang") || h.includes("level"));

    const parsedUsers: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
      
      const name = nameIdx !== -1 ? cols[nameIdx] : "";
      const email = emailIdx !== -1 ? cols[emailIdx] : "";
      const passwordRaw = passIdx !== -1 ? cols[passIdx] : "";
      
      let rawRole = roleIdx !== -1 ? cols[roleIdx]?.toUpperCase() : "STUDENT";
      if (rawRole.includes("GURU") || rawRole.includes("TEACHER")) {
        rawRole = "TEACHER";
      } else if (rawRole.includes("SISWA") || rawRole.includes("STUDENT")) {
        rawRole = "STUDENT";
      } else {
        rawRole = "STUDENT";
      }

      const rawJenjang = jenjangIdx !== -1 ? cols[jenjangIdx] : "";
      const educationLevels = rawJenjang
        ? rawJenjang
            .split(";")
            .map((lvl) => lvl.trim().toUpperCase())
            .filter((lvl) => ["SD", "SMP", "SMA", "UNIVERSITY"].includes(lvl))
        : [];

      if (name && email) {
        parsedUsers.push({
          name,
          email,
          passwordRaw,
          role: rawRole,
          educationLevels,
        });
      }
    }

    return parsedUsers;
  };

  const handleDownloadTemplate = () => {
    const csvContent = "Nama,Email,Password,Role,Jenjang\nBudi Raharjo,budi@wordit.com,password123,STUDENT,\nBu Sari,sari@wordit.com,password123,TEACHER,SD;SMP";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "wordit-import-template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast.error("Format file harus berupa CSV.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      try {
        const parsed = parseCSV(text);
        if (parsed.length === 0) {
          toast.error("Gagal membaca data dari file CSV. Periksa format header.");
          return;
        }
        setImportUsers(parsed);
        toast.success(`Berhasil memuat ${parsed.length} baris data CSV!`);
      } catch (err) {
        console.error(err);
        toast.error("Gagal mem-parsing berkas CSV.");
      }
    };
    reader.readAsText(file);
  };

  const handleBulkImportSubmit = async () => {
    if (importUsers.length === 0) return;
    setIsImporting(true);
    try {
      const result = await bulkImportUsers(importUsers);
      setImportResults(result);
      if (result.failed === 0) {
        toast.success(`Semua ${result.success} user berhasil diimpor! 🎉`);
      } else {
        toast.error(`Berhasil mengimpor ${result.success} user, namun ada ${result.failed} yang gagal.`);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Gagal melakukan impor massal.");
    } finally {
      setIsImporting(false);
    }
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

          {/* Import CSV Button */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-4.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-100 rounded-xl text-xs font-black transition-all shrink-0 w-full sm:w-auto justify-center"
            title="Impor Pengguna Massal"
          >
            <Upload size={14} />
            <span>Impor CSV</span>
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
                      <div className="flex flex-col gap-1 text-left">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black border w-max ${
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

                        {/* Sinkronisasi Visual: Deteksi Ajuan Jenjang Baru */}
                        {u.role === "TEACHER" && u.approvalStatus === "PENDING" && u.profile?.bio?.includes("||PENDING_REQ_LEVELS||") && (
                          <div className="mt-1 bg-amber-50/60 border border-amber-200/70 p-2 rounded-xl max-w-[180px] space-y-0.5">
                            <span className="text-[9px] text-amber-800 font-black uppercase tracking-wider block">
                              Ajuan Jenjang Baru:
                            </span>
                            <span className="text-[10px] text-indigo-600 font-extrabold block tracking-wide uppercase">
                              {JSON.parse(u.profile.bio.split("||PENDING_REQ_LEVELS||")[1] || "[]").join(", ")}
                            </span>
                          </div>
                        )}
                      </div>
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
                  {/* Tampilkan teks bio asli dengan menyaring kode pembatas jika ada */}
                  {selectedUser.profile?.bio ? selectedUser.profile.bio.split("||PENDING_REQ_LEVELS||")[0]?.trim() : "Pengguna belum menulis bio."}
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
      {/* ─── IMPORT USER MODAL ─── */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl relative border border-slate-100 animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            {/* Close Button */}
            <button
              onClick={() => {
                if (!isImporting) {
                  setIsImportModalOpen(false);
                  setImportUsers([]);
                  setImportResults(null);
                }
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition"
              disabled={isImporting}
            >
              <X size={20} />
            </button>

            {/* Modal Header */}
            <div className="border-b border-slate-100 pb-5 mb-5 shrink-0">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Upload size={20} className="text-emerald-600" />
                Impor Pengguna secara Massal
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-bold uppercase tracking-wider">
                Upload berkas CSV untuk mendaftarkan banyak guru atau siswa sekaligus
              </p>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto space-y-5 pr-2 custom-scrollbar">
              {!importResults ? (
                <>
                  {/* Instructions */}
                  <div className="bg-slate-50 border border-slate-100 p-4.5 rounded-2xl space-y-2.5">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                      📋 Petunjuk Format CSV
                    </h4>
                    <p className="text-xs text-slate-500 font-bold leading-relaxed">
                      1. Pastikan kolom memiliki header berikut: <span className="text-indigo-600 font-mono font-black">Nama, Email, Password, Role, Jenjang</span><br />
                      2. <span className="font-black text-slate-700">Role</span> berisi <span className="font-mono text-indigo-600">STUDENT</span> (siswa) atau <span className="font-mono text-indigo-600">TEACHER</span> (guru).<br />
                      3. <span className="font-black text-slate-700">Jenjang</span> (khusus guru) dipisah titik koma jika lebih dari satu. Contoh: <span className="font-mono text-indigo-600">SD;SMP;SMA</span><br />
                      4. Password minimal harus <span className="font-black text-slate-700">6 karakter</span>.
                    </p>
                    <button
                      onClick={handleDownloadTemplate}
                      className="text-xs font-black text-indigo-600 hover:underline flex items-center gap-1.5 pt-1.5"
                    >
                      <Download size={12} /> Unduh Template Contoh CSV
                    </button>
                  </div>

                  {/* File Selector */}
                  <div className="border-4 border-dashed border-slate-100 rounded-3xl p-8 text-center hover:border-indigo-200 transition relative">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="space-y-2 pointer-events-none">
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold shadow-inner">
                        📂
                      </div>
                      <p className="text-sm font-bold text-slate-700">
                        Klik untuk pilih file atau seret file CSV ke sini
                      </p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                        Hanya mendukung format .CSV
                      </p>
                    </div>
                  </div>

                  {/* Preview Table */}
                  {importUsers.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-600">
                          Pratinjau Data ({importUsers.length} Pengguna)
                        </span>
                        <button
                          onClick={() => setImportUsers([])}
                          className="text-[10px] text-rose-500 font-black uppercase hover:underline"
                        >
                          Hapus File
                        </button>
                      </div>
                      <div className="border border-slate-100 rounded-2xl overflow-hidden max-h-56 overflow-y-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead className="bg-slate-50 border-b border-slate-100 sticky top-0">
                            <tr className="text-slate-400 font-black uppercase text-[9px] tracking-wider">
                              <th className="py-2.5 px-4">Nama</th>
                              <th className="py-2.5 px-4">Email</th>
                              <th className="py-2.5 px-4">Password</th>
                              <th className="py-2.5 px-4">Role</th>
                              <th className="py-2.5 px-4">Jenjang</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50 font-bold text-slate-700 bg-white">
                            {importUsers.map((u, index) => (
                              <tr key={index}>
                                <td className="py-2 px-4 truncate max-w-[120px]">{u.name}</td>
                                <td className="py-2 px-4 truncate max-w-[140px]">{u.email}</td>
                                <td className="py-2 px-4 font-mono text-slate-400">{u.passwordRaw}</td>
                                <td className="py-2 px-4">
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-black border ${
                                    u.role === 'TEACHER' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                                  }`}>
                                    {u.role}
                                  </span>
                                </td>
                                <td className="py-2 px-4">
                                  {u.educationLevels.length > 0 ? u.educationLevels.join(", ") : "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Import Results Feedback */
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl text-center space-y-3">
                    <div className="text-4xl">
                      {importResults.failed === 0 ? "🎉" : "💡"}
                    </div>
                    <h4 className="text-lg font-black text-slate-800">
                      Proses Impor Selesai!
                    </h4>
                    <div className="flex justify-center gap-6 text-xs mt-2">
                      <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-4 py-2 rounded-2xl text-center">
                        <span className="text-xl font-black block">{importResults.success}</span>
                        <span className="font-bold uppercase text-[9px] tracking-wider">Sukses</span>
                      </div>
                      <div className="bg-rose-50 text-rose-700 border border-rose-100 px-4 py-2 rounded-2xl text-center">
                        <span className="text-xl font-black block">{importResults.failed}</span>
                        <span className="font-bold uppercase text-[9px] tracking-wider">Gagal</span>
                      </div>
                    </div>
                  </div>

                  {/* Errors details list */}
                  {importResults.errors.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-xs font-black uppercase tracking-wider text-rose-500 px-1">
                        Detail Error Pendaftaran ({importResults.errors.length}):
                      </h5>
                      <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4 max-h-48 overflow-y-auto space-y-1.5">
                        {importResults.errors.map((err, index) => (
                          <div key={index} className="text-xs text-rose-700 font-bold flex items-start gap-1.5">
                            <span className="text-rose-400">•</span>
                            <span>{err}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="mt-6 pt-5 border-t border-slate-100 flex justify-end gap-3 shrink-0">
              {!importResults ? (
                <>
                  <button
                    onClick={() => {
                      setIsImportModalOpen(false);
                      setImportUsers([]);
                    }}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                    disabled={isImporting}
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleBulkImportSubmit}
                    disabled={importUsers.length === 0 || isImporting}
                    className={`px-5 py-2.5 rounded-xl text-xs font-black text-white shadow-md transition flex items-center gap-1.5 ${
                      importUsers.length === 0 || isImporting
                        ? "bg-indigo-300 cursor-not-allowed shadow-none"
                        : "bg-indigo-600 hover:bg-indigo-500"
                    }`}
                  >
                    {isImporting ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Memproses...</span>
                      </>
                    ) : (
                      <span>Mulai Impor ({importUsers.length} User)</span>
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setIsImportModalOpen(false);
                    setImportUsers([]);
                    setImportResults(null);
                    loadUsers(); // reload user list
                  }}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-xs transition shadow-md"
                >
                  Selesai
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onCancel={closeConfirm}
      />
    </div>
  );
}