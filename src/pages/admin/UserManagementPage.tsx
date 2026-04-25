import { useEffect, useState } from "react"
import { getUsers, updateUser, deleteUser, approveUser } from "../services/user.service"
import type { User } from "../../types/user"
import { toast } from "react-hot-toast"

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [search, setSearch] = useState("") // Pastikan ini digunakan di input pencarian
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUsers() {
      try {
        const response = await getUsers();
        // Backend mengembalikan objek { data, meta }, jadi ambil .data
        const userData = Array.isArray(response) ? response : response.data;
        setUsers(userData);
        setFilteredUsers(userData);
      } catch (err) {
        console.error(err);
        toast.error("Gagal mengambil data user");
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, []);

  // Update filter pencarian (Memperbaiki warning 'setSearch' is declared but never read)
  useEffect(() => {
    let filtered = users.filter((u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    );

    if (statusFilter !== "ALL") {
      filtered = filtered.filter((u) => u.approvalStatus === statusFilter);
    }

    setFilteredUsers(filtered);
  }, [search, users, statusFilter]);

  // Fungsi Handle Approval (Sprint 2 - FE-NEW-02)
  async function handleApproval(id: string, action: "APPROVE" | "REJECT") {
    try {
      const updated = await approveUser(id, action)
      setUsers(users.map((u) => (u.id === id ? updated : u)))
      toast.success(`User berhasil di-${action.toLowerCase()}`)
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  async function changeRole(id: string, role: string) {
    try {
      const updated = await updateUser(id, { role })
      setUsers(users.map((u) => (u.id === id ? updated : u)))
    } catch (err) {
      console.error(err)
    }
  }

  async function removeUser(id: string) {
    if (!confirm("Delete this user?")) return
    try {
      await deleteUser(id)
      setUsers(users.filter((u) => u.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 pt-32">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 pt-28 px-6 relative overflow-hidden">
      <div className="absolute top-20 -right-10 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50"></div>

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* HEADER */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-800">User Management 👥</h1>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Kelola Approval Guru & Hak Akses</p>
          </div>

          <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
            {["ALL", "PENDING", "APPROVED", "REJECTED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${statusFilter === st ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"}`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1000px]">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr className="text-slate-400 font-black uppercase text-[10px] tracking-widest">
                  <th className="py-6 px-8 text-center">User</th>
                  <th className="py-6 px-4">Jenjang (Level)</th>
                  <th className="py-6 px-4">Status Approval</th>
                  <th className="py-6 px-4 text-center">Role</th>
                  <th className="py-6 px-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="group hover:bg-slate-50/50 transition-all">
                    <td className="py-5 px-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center font-black text-indigo-500 uppercase">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 leading-none mb-1">{user.name}</p>
                          <p className="text-slate-400 font-bold text-xs">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-5 px-4">
                      {user.educationLevel ? (
                        <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-black border border-blue-100">
                          {user.educationLevel}
                        </span>
                      ) : (
                        <span className="text-slate-300 italic text-[10px]">Not set</span>
                      )}
                    </td>

                    <td className="py-5 px-4">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black border ${user.approvalStatus === "APPROVED" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                        user.approvalStatus === "PENDING" ? "bg-amber-50 text-amber-600 border-amber-100 animate-pulse" :
                          "bg-rose-50 text-rose-600 border-rose-100"
                        }`}>
                        ● {user.approvalStatus}
                      </span>
                    </td>

                    <td className="py-5 px-4 text-center">
                      <select
                        value={user.role}
                        onChange={(e) => changeRole(user.id, e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg font-black text-[10px] outline-none hover:border-indigo-300"
                      >
                        <option value="STUDENT">🎓 STUDENT</option>
                        <option value="TEACHER">👨‍🏫 TEACHER</option>
                        <option value="ADMIN">🛡️ ADMIN</option>
                      </select>
                    </td>

                    <td className="py-5 px-8 text-right">
                      <div className="flex justify-end gap-2">
                        {user.role === "TEACHER" && user.approvalStatus === "PENDING" && (
                          <>
                            <button onClick={() => handleApproval(user.id, "APPROVE")} className="p-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-100 transition-all">✅</button>
                            <button onClick={() => handleApproval(user.id, "REJECT")} className="p-2.5 bg-rose-500 text-white rounded-xl hover:bg-rose-600 shadow-lg shadow-rose-100 transition-all">❌</button>
                          </>
                        )}
                        <button onClick={() => removeUser(user.id)} className="px-4 py-2 text-rose-500 font-black text-[10px] hover:bg-rose-50 rounded-xl transition-all">Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}