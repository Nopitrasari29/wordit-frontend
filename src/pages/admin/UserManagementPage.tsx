import { useEffect, useState, useCallback } from "react";
import socket from "../../hooks/useSocket";
import {
  getUsers,
  updateUser,
  deleteUser,
  approveUser,
  bulkImportUsers,
  bulkDeleteUsers,
} from "../services/user.service";
import type { User } from "../../types/user";
import { toast } from "react-hot-toast";
import {
  Check, X, Trash2, Search, Download, Eye, Upload,
  RefreshCw, ChevronLeft, ChevronRight, CheckSquare, Square,
} from "lucide-react";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { useAuth } from "../../context/AuthContext";

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const PAGE_LIMIT = 10;

export default function UserManagementPage() {
  const { user: currentAdmin } = useAuth();

  // ─── Data ───────────────────────────────────────────────────
  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, limit: PAGE_LIMIT, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  // ─── Filter & Search ─────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  // ─── Selection (Bulk) ────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // ─── Detail Modal ────────────────────────────────────────────
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // ─── Import Modal ────────────────────────────────────────────
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importUsers, setImportUsers] = useState<any[]>([]);
  const [importResults, setImportResults] = useState<{
    total: number; success: number; failed: number; errors: string[];
  } | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // ─── Confirm Modal ───────────────────────────────────────────
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean; title: string; message: string; onConfirm: () => void; variant?: "danger";
  }>({ isOpen: false, title: "", message: "", onConfirm: () => {} });

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmConfig({ isOpen: true, title, message, variant: "danger", onConfirm: () => { onConfirm(); closeConfirm(); } });
  };
  const closeConfirm = () => setConfirmConfig((p) => ({ ...p, isOpen: false }));

  // ─── Fetch Users (server-side filtering + pagination) ────────
  const loadUsers = useCallback(async (page = currentPage, q = search, status = statusFilter) => {
    setLoading(true);
    setSelectedIds(new Set()); // reset selection on reload
    try {
      const params: any = { page, limit: PAGE_LIMIT };
      if (q.trim()) params.search = q.trim();
      if (status !== "ALL") params.approvalStatus = status;

      const response = await getUsers(params);
      // response can be { data: [...], meta: {...} } or array
      if (Array.isArray(response)) {
        setUsers(response);
        setMeta({ page: 1, limit: PAGE_LIMIT, total: response.length, totalPages: 1 });
        setPendingCount(response.filter((u: any) => u.approvalStatus === "PENDING").length);
      } else {
        const { data, meta: m } = response as any;
        setUsers(data ?? []);
        if (m) setMeta(m);
        setPendingCount((data ?? []).filter((u: any) => u.approvalStatus === "PENDING").length);
      }
    } catch (err) {
      toast.error("Gagal mengambil data user");
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line

  useEffect(() => { loadUsers(1, search, statusFilter); }, []); // eslint-disable-line

  // ─── Socket ──────────────────────────────────────────────────
  useEffect(() => {
    socket.emit("join_admin_room");
    const handleRefresh = () => loadUsers(currentPage, search, statusFilter);
    const handleNewTeacher = async (payload: { name?: string }) => {
      const name = payload?.name ? `"${payload.name}"` : "baru";
      toast(`👨‍🏫 Guru ${name} baru saja mendaftar dan menunggu persetujuan!`, {
        duration: 6000,
        style: { background: "#fef3c7", color: "#92400e", fontWeight: "800", borderRadius: "1rem", border: "1px solid #fcd34d" },
        icon: "🔔",
      });
      loadUsers(currentPage, search, statusFilter);
    };
    socket.on("admin_refresh", handleRefresh);
    socket.on("new_teacher_registered", handleNewTeacher);
    return () => {
      socket.off("admin_refresh", handleRefresh);
      socket.off("new_teacher_registered", handleNewTeacher);
    };
  }, [currentPage, search, statusFilter]); // eslint-disable-line

  // ─── Search debounce ─────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setCurrentPage(1);
      loadUsers(1, searchInput, statusFilter);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]); // eslint-disable-line

  // ─── Filter change ───────────────────────────────────────────
  const handleFilterChange = (st: string) => {
    setStatusFilter(st);
    setCurrentPage(1);
    setSelectedIds(new Set());
    loadUsers(1, search, st);
  };

  // ─── Pagination ──────────────────────────────────────────────
  const goToPage = (pg: number) => {
    if (pg < 1 || pg > meta.totalPages) return;
    setCurrentPage(pg);
    loadUsers(pg, search, statusFilter);
  };

  // ─── Selection helpers ───────────────────────────────────────
  const allCurrentSelected = users.length > 0 && users.every((u) => selectedIds.has(u.id));
  const someSelected = selectedIds.size > 0;

  const toggleSelectAll = () => {
    if (allCurrentSelected) {
      setSelectedIds(new Set());
    } else {
      const ids = new Set(users.map((u) => u.id));
      // exclude self
      if (currentAdmin?.id) ids.delete(currentAdmin.id);
      setSelectedIds(ids);
    }
  };

  const toggleSelectOne = (id: string) => {
    if (id === currentAdmin?.id) return; // can't select self
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // ─── Actions ─────────────────────────────────────────────────
  async function handleApproval(id: string, action: "APPROVE" | "REJECT") {
    try {
      const updated = await approveUser(id, action);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      toast.success(`User berhasil di-${action.toLowerCase()}`);
    } catch (err: any) {
      toast.error(err.message || "Gagal mengubah status approval");
    }
  }

  async function changeRole(id: string, role: string) {
    try {
      const updated = await updateUser(id, { role });
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      toast.success("Role user berhasil diperbarui");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal mengubah role");
    }
  }

  function removeUser(id: string) {
    showConfirm(
      "Hapus Pengguna",
      "Apakah Anda yakin ingin menghapus user ini secara permanen? Tindakan ini tidak dapat dibatalkan.",
      async () => {
        try {
          await deleteUser(id);
          setUsers((prev) => prev.filter((u) => u.id !== id));
          setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
          toast.success("User berhasil dihapus");
          // reload if current page empty
          if (users.length === 1 && currentPage > 1) goToPage(currentPage - 1);
          else loadUsers(currentPage, search, statusFilter);
        } catch (err) {
          toast.error("Gagal menghapus user");
        }
      }
    );
  }

  function handleBulkDelete() {
    if (selectedIds.size === 0) return;
    showConfirm(
      "Hapus Massal Pengguna",
      `Anda akan menghapus ${selectedIds.size} pengguna secara permanen. Semua data terkait (kuis, hasil, sesi) juga akan ikut terhapus. Tindakan ini TIDAK DAPAT dibatalkan!`,
      async () => {
        setIsBulkDeleting(true);
        try {
          const result = await bulkDeleteUsers(Array.from(selectedIds));
          if (result.failed === 0) {
            toast.success(`✅ ${result.success} pengguna berhasil dihapus!`);
          } else {
            toast.error(`Berhasil hapus ${result.success}, gagal ${result.failed}.`);
          }
          setSelectedIds(new Set());
          const newPage = currentPage > 1 && users.length <= result.success ? currentPage - 1 : currentPage;
          loadUsers(newPage, search, statusFilter);
        } catch (err: any) {
          toast.error(err.message || "Gagal melakukan hapus massal");
        } finally {
          setIsBulkDeleting(false);
        }
      }
    );
  }

  // ─── Export CSV ──────────────────────────────────────────────
  const handleExportCSV = () => {
    const headers = ["Nama", "Email", "Role", "Jenjang Pendidikan", "Status Approval", "Kuis Dibuat", "Poin XP", "Bio"];
    const rows = users.map((u: any) => [
      u.name, u.email, u.role,
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
    link.setAttribute("download", `wordit-users-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Laporan pengguna berhasil diekspor ke CSV!");
  };

  // ─── CSV Import helpers ──────────────────────────────────────
  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
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
      if (rawRole.includes("GURU") || rawRole.includes("TEACHER")) rawRole = "TEACHER";
      else rawRole = "STUDENT";
      const rawJenjang = jenjangIdx !== -1 ? cols[jenjangIdx] : "";
      const educationLevels = rawJenjang
        ? rawJenjang.split(";").map((l) => l.trim().toUpperCase()).filter((l) => ["SD", "SMP", "SMA", "UNIVERSITY"].includes(l))
        : [];
      if (name && email) parsedUsers.push({ name, email, passwordRaw, role: rawRole, educationLevels });
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
    if (!file.name.endsWith(".csv")) { toast.error("Format file harus berupa CSV."); return; }
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      try {
        const parsed = parseCSV(text);
        if (parsed.length === 0) { toast.error("Gagal membaca data dari file CSV. Periksa format header."); return; }
        setImportUsers(parsed);
        toast.success(`Berhasil memuat ${parsed.length} baris data CSV!`);
      } catch { toast.error("Gagal mem-parsing berkas CSV."); }
    };
    reader.readAsText(file);
  };

  const handleBulkImportSubmit = async () => {
    if (importUsers.length === 0) return;
    setIsImporting(true);
    try {
      const result = await bulkImportUsers(importUsers);
      setImportResults(result);
      if (result.failed === 0) toast.success(`Semua ${result.success} user berhasil diimpor! 🎉`);
      else toast.error(`Berhasil mengimpor ${result.success} user, namun ada ${result.failed} yang gagal.`);
    } catch (err: any) {
      toast.error(err.message || "Gagal melakukan impor massal.");
    } finally {
      setIsImporting(false);
    }
  };

  // ─── Pagination pages array ──────────────────────────────────
  const getPaginationPages = () => {
    const { totalPages } = meta;
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [1];
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  // ─── Render ──────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* ── HEADER & CONTROLS ── */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
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
            Review status guru, verifikasi akun, dan kelola peran user · Total: {meta.total} pengguna
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 items-center w-full xl:w-auto">
          {/* Search */}
          <div className="relative flex items-center w-full sm:w-56">
            <input
              type="text"
              placeholder="Cari nama atau email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="bg-slate-50 border border-slate-200 px-4 py-2 pl-9 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all w-full"
            />
            <Search size={14} className="absolute left-3 text-slate-400" />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            {["ALL", "PENDING", "APPROVED", "REJECTED"].map((st) => (
              <button
                key={st}
                onClick={() => handleFilterChange(st)}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all uppercase tracking-wider ${
                  statusFilter === st
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {st}{st === "PENDING" && pendingCount > 0 ? ` (${pendingCount})` : ""}
              </button>
            ))}
          </div>

          {/* Buttons */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-100 rounded-xl text-xs font-black transition-all shrink-0"
            title="Ekspor CSV"
          >
            <Download size={14} /><span>Ekspor CSV</span>
          </button>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-100 rounded-xl text-xs font-black transition-all shrink-0"
            title="Impor CSV Massal"
          >
            <Upload size={14} /><span>Impor CSV</span>
          </button>
        </div>
      </div>

      {/* ── BULK ACTION TOOLBAR (muncul saat ada yang dipilih) ── */}
      {someSelected && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl px-5 py-3 flex items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-rose-100 rounded-xl flex items-center justify-center">
              <CheckSquare size={16} className="text-rose-600" />
            </div>
            <div>
              <p className="text-sm font-black text-rose-800">{selectedIds.size} pengguna dipilih</p>
              <p className="text-[10px] text-rose-500 font-bold">Pilih aksi yang ingin diterapkan pada pengguna terpilih</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl text-xs font-black transition"
            >
              Batal Pilih
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black transition shadow-sm disabled:opacity-60"
            >
              {isBulkDeleting ? (
                <><RefreshCw size={13} className="animate-spin" /> Menghapus...</>
              ) : (
                <><Trash2 size={13} /> Hapus {selectedIds.size} Pengguna</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── TABLE ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[960px] border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-slate-400 font-black uppercase text-[10px] tracking-widest">
                {/* Checkbox header */}
                <th className="py-4 px-4 w-10">
                  <button
                    onClick={toggleSelectAll}
                    className="text-slate-400 hover:text-indigo-600 transition-colors"
                    title={allCurrentSelected ? "Hapus semua pilihan" : "Pilih semua di halaman ini"}
                  >
                    {allCurrentSelected ? (
                      <CheckSquare size={16} className="text-indigo-600" />
                    ) : someSelected ? (
                      <div className="w-4 h-4 border-2 border-indigo-400 rounded bg-indigo-100 flex items-center justify-center">
                        <div className="w-2 h-0.5 bg-indigo-600" />
                      </div>
                    ) : (
                      <Square size={16} />
                    )}
                  </button>
                </th>
                <th className="py-4 px-4">Pengguna</th>
                <th className="py-4 px-4">Jenjang Pendidikan</th>
                <th className="py-4 px-4">Status Approval</th>
                <th className="py-4 px-4 text-center">Role / Hak Akses</th>
                <th className="py-4 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-4"><div className="w-4 h-4 bg-slate-200 rounded" /></td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-200 rounded-xl" />
                        <div className="space-y-1.5">
                          <div className="h-3 w-32 bg-slate-200 rounded" />
                          <div className="h-2.5 w-40 bg-slate-100 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4"><div className="h-3 w-16 bg-slate-100 rounded" /></td>
                    <td className="py-4 px-4"><div className="h-5 w-20 bg-slate-100 rounded-full" /></td>
                    <td className="py-4 px-4 text-center"><div className="h-6 w-24 bg-slate-100 rounded-lg mx-auto" /></td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex justify-end gap-2">
                        <div className="w-8 h-8 bg-slate-100 rounded-xl" />
                        <div className="w-8 h-8 bg-slate-100 rounded-xl" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl">🔍</div>
                      <p className="font-bold text-slate-400">Tidak ada pengguna ditemukan.</p>
                      {(search || statusFilter !== "ALL") && (
                        <button
                          onClick={() => { setSearchInput(""); setSearch(""); handleFilterChange("ALL"); }}
                          className="text-xs text-indigo-600 font-black hover:underline"
                        >
                          Hapus semua filter
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isSelf = u.id === currentAdmin?.id;
                  const isSelected = selectedIds.has(u.id);
                  return (
                    <tr
                      key={u.id}
                      className={`group transition-colors ${
                        isSelected
                          ? "bg-indigo-50/60"
                          : isSelf
                          ? "bg-amber-50/30"
                          : "hover:bg-slate-50/40"
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-4 px-4">
                        <button
                          onClick={() => toggleSelectOne(u.id)}
                          disabled={isSelf}
                          className={`transition-colors ${isSelf ? "opacity-30 cursor-not-allowed" : "text-slate-300 hover:text-indigo-600"}`}
                          title={isSelf ? "Tidak dapat memilih akun sendiri" : ""}
                        >
                          {isSelected ? (
                            <CheckSquare size={16} className="text-indigo-600" />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>
                      </td>

                      {/* User Info */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm uppercase shrink-0 ${
                            isSelf ? "bg-amber-50 border border-amber-200 text-amber-600" : "bg-indigo-50 border border-indigo-100 text-indigo-600"
                          }`}>
                            {u.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 text-sm truncate leading-snug flex items-center gap-1.5">
                              {u.name}
                              {isSelf && <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-black">Anda</span>}
                            </p>
                            <p className="text-slate-400 font-bold text-xs truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Education Levels */}
                      <td className="py-4 px-4">
                        {u.educationLevels && u.educationLevels.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[160px]">
                            {u.educationLevels.map((lvl: string) => (
                              <span key={lvl} className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-md text-[9px] font-black border border-blue-100">{lvl}</span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-300 italic text-[10px]">Tidak ditentukan</span>
                        )}
                      </td>

                      {/* Approval Status */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black border w-max ${
                            u.approvalStatus === "APPROVED"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                              : u.approvalStatus === "PENDING"
                              ? "bg-amber-50 text-amber-600 border-amber-100 animate-pulse"
                              : "bg-rose-50 text-rose-600 border-rose-100"
                          }`}>
                            <span className={`w-1 h-1 rounded-full ${
                              u.approvalStatus === "APPROVED" ? "bg-emerald-500"
                              : u.approvalStatus === "PENDING" ? "bg-amber-500"
                              : "bg-rose-500"
                            }`} />
                            {u.approvalStatus}
                          </span>
                          {u.role === "TEACHER" && u.approvalStatus === "PENDING" && u.profile?.bio?.includes("||PENDING_REQ_LEVELS||") && (
                            <div className="mt-1 bg-amber-50/60 border border-amber-200/70 p-1.5 rounded-xl max-w-[160px] space-y-0.5">
                              <span className="text-[9px] text-amber-800 font-black uppercase block">Ajuan Jenjang:</span>
                              <span className="text-[10px] text-indigo-600 font-extrabold block uppercase">
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
                          disabled={isSelf}
                          className={`bg-slate-50 border border-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg font-bold text-[10px] outline-none hover:border-indigo-500 cursor-pointer ${isSelf ? "opacity-60 cursor-not-allowed" : ""}`}
                        >
                          <option value="STUDENT">🎓 STUDENT</option>
                          <option value="TEACHER">👨‍🏫 TEACHER</option>
                          <option value="ADMIN">🛡️ ADMIN</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex justify-end items-center gap-1.5">
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
                          <button
                            onClick={() => setSelectedUser(u)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                            title="Lihat Detail"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => removeUser(u.id)}
                            disabled={isSelf}
                            className={`p-2 rounded-xl transition-all ${isSelf ? "text-slate-200 cursor-not-allowed" : "text-slate-400 hover:text-rose-600 hover:bg-rose-50"}`}
                            title={isSelf ? "Tidak dapat hapus akun sendiri" : "Hapus Pengguna"}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION ── */}
        {!loading && meta.totalPages > 1 && (
          <div className="px-5 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Info */}
            <p className="text-xs text-slate-400 font-bold">
              Menampilkan{" "}
              <span className="text-slate-700 font-black">
                {(currentPage - 1) * meta.limit + 1}–{Math.min(currentPage * meta.limit, meta.total)}
              </span>{" "}
              dari <span className="text-slate-700 font-black">{meta.total}</span> pengguna
            </p>

            {/* Page buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={14} />
              </button>

              {getPaginationPages().map((pg, idx) =>
                pg === "..." ? (
                  <span key={`ellipsis-${idx}`} className="w-8 text-center text-slate-400 font-bold text-xs">…</span>
                ) : (
                  <button
                    key={pg}
                    onClick={() => goToPage(pg as number)}
                    className={`w-8 h-8 rounded-lg text-xs font-black transition ${
                      currentPage === pg
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "border border-slate-200 text-slate-500 hover:border-indigo-400 hover:text-indigo-600"
                    }`}
                  >
                    {pg}
                  </button>
                )
              )}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === meta.totalPages}
                className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Jika hanya 1 halaman, tampilkan total saja */}
        {!loading && meta.totalPages <= 1 && meta.total > 0 && (
          <div className="px-5 py-3.5 border-t border-slate-100">
            <p className="text-xs text-slate-400 font-bold">
              Menampilkan semua <span className="text-slate-700 font-black">{meta.total}</span> pengguna
            </p>
          </div>
        )}
      </div>

      {/* ── DETAIL USER MODAL ── */}
      {selectedUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative border border-slate-100 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-4 border-b border-slate-100 pb-5 mb-5">
              <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center font-black text-indigo-600 text-2xl uppercase shrink-0">
                {selectedUser.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-md text-[9px] font-black uppercase tracking-wider">{selectedUser.role}</span>
                <h3 className="text-xl font-black text-slate-800 mt-1 truncate">{selectedUser.name}</h3>
                <p className="text-slate-400 text-xs font-bold truncate">{selectedUser.email}</p>
              </div>
            </div>
            <div className="space-y-4 text-slate-600">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Bio / Deskripsi</h4>
                <p className="text-sm font-semibold text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 min-h-[60px] whitespace-pre-wrap">
                  {selectedUser.profile?.bio ? selectedUser.profile.bio.split("||PENDING_REQ_LEVELS||")[0]?.trim() : "Pengguna belum menulis bio."}
                </p>
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Jenjang Pendidikan</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedUser.educationLevels && selectedUser.educationLevels.length > 0 ? (
                    selectedUser.educationLevels.map((lvl: string) => (
                      <span key={lvl} className="bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-lg text-xs font-black">{lvl}</span>
                    ))
                  ) : (
                    <span className="text-slate-400 text-xs font-bold italic">Tidak ditentukan</span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                    {selectedUser.role === "TEACHER" ? "Kuis Dibuat" : selectedUser.role === "STUDENT" ? "Total Poin XP" : "Status Akun"}
                  </span>
                  <span className="text-lg font-black text-slate-800 mt-1 block">
                    {selectedUser.role === "TEACHER" ? `${selectedUser._count?.gamesCreated ?? 0} game`
                      : selectedUser.role === "STUDENT" ? `${selectedUser.profile?.totalPoints ?? 0} XP`
                      : "Administrator"}
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Tanggal Terdaftar</span>
                  <span className="text-xs font-bold text-slate-700 mt-2 block">
                    {new Date(selectedUser.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </div>
              </div>
            </div>
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

      {/* ── IMPORT USER MODAL ── */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl relative border border-slate-100 animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <button
              onClick={() => { if (!isImporting) { setIsImportModalOpen(false); setImportUsers([]); setImportResults(null); } }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition"
              disabled={isImporting}
            >
              <X size={20} />
            </button>
            <div className="border-b border-slate-100 pb-5 mb-5 shrink-0">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Upload size={20} className="text-emerald-600" /> Impor Pengguna secara Massal
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-bold uppercase tracking-wider">Upload berkas CSV untuk mendaftarkan banyak guru atau siswa sekaligus</p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-5 pr-1">
              {!importResults ? (
                <>
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-2.5">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">📋 Petunjuk Format CSV</h4>
                    <p className="text-xs text-slate-500 font-bold leading-relaxed">
                      1. Header kolom: <span className="text-indigo-600 font-mono font-black">Nama, Email, Password, Role, Jenjang</span><br />
                      2. <span className="font-black text-slate-700">Role</span>: <span className="font-mono text-indigo-600">STUDENT</span> atau <span className="font-mono text-indigo-600">TEACHER</span>.<br />
                      3. <span className="font-black text-slate-700">Jenjang</span> (khusus guru): <span className="font-mono text-indigo-600">SD;SMP;SMA</span><br />
                      4. Password minimal <span className="font-black text-slate-700">6 karakter</span>.
                    </p>
                    <button onClick={handleDownloadTemplate} className="text-xs font-black text-indigo-600 hover:underline flex items-center gap-1.5 pt-1.5">
                      <Download size={12} /> Unduh Template Contoh CSV
                    </button>
                  </div>

                  <div className="border-4 border-dashed border-slate-100 rounded-3xl p-8 text-center hover:border-indigo-200 transition relative">
                    <input type="file" accept=".csv" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className="space-y-2 pointer-events-none">
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto text-xl shadow-inner">📂</div>
                      <p className="text-sm font-bold text-slate-700">Klik untuk pilih file atau seret file CSV ke sini</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Hanya mendukung format .CSV</p>
                    </div>
                  </div>

                  {importUsers.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-600">Pratinjau Data ({importUsers.length} Pengguna)</span>
                        <button onClick={() => setImportUsers([])} className="text-[10px] text-rose-500 font-black uppercase hover:underline">Hapus File</button>
                      </div>
                      <div className="border border-slate-100 rounded-2xl overflow-hidden max-h-52 overflow-y-auto">
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
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-black border ${u.role === "TEACHER" ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-blue-50 text-blue-600 border-blue-100"}`}>{u.role}</span>
                                </td>
                                <td className="py-2 px-4">{u.educationLevels.length > 0 ? u.educationLevels.join(", ") : "-"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl text-center space-y-3">
                    <div className="text-4xl">{importResults.failed === 0 ? "🎉" : "💡"}</div>
                    <h4 className="text-lg font-black text-slate-800">Proses Impor Selesai!</h4>
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
                  {importResults.errors.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-xs font-black uppercase tracking-wider text-rose-500 px-1">Detail Error ({importResults.errors.length}):</h5>
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

            <div className="mt-5 pt-5 border-t border-slate-100 flex justify-end gap-3 shrink-0">
              {!importResults ? (
                <>
                  <button
                    onClick={() => { setIsImportModalOpen(false); setImportUsers([]); }}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                    disabled={isImporting}
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleBulkImportSubmit}
                    disabled={importUsers.length === 0 || isImporting}
                    className={`px-5 py-2.5 rounded-xl text-xs font-black text-white shadow-md transition flex items-center gap-1.5 ${
                      importUsers.length === 0 || isImporting ? "bg-indigo-300 cursor-not-allowed shadow-none" : "bg-indigo-600 hover:bg-indigo-500"
                    }`}
                  >
                    {isImporting ? (
                      <><RefreshCw size={14} className="animate-spin" /><span>Memproses...</span></>
                    ) : (
                      <span>Mulai Impor ({importUsers.length} User)</span>
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { setIsImportModalOpen(false); setImportUsers([]); setImportResults(null); loadUsers(1, search, statusFilter); }}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-xs transition shadow-md"
                >
                  Selesai & Refresh
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── CONFIRM MODAL ── */}
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