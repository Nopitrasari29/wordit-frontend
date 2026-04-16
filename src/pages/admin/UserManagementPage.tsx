import { useEffect, useState } from "react"
import { getUsers, updateUser, deleteUser } from "../services/user.service"
import type { User } from "../../types/user"

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await getUsers()
        setUsers(data)
        setFilteredUsers(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadUsers()
  }, [])

  useEffect(() => {
    const filtered = users.filter((u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    )
    setFilteredUsers(filtered)
  }, [search, users])

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

      {/* Dekorasi Background */}
      <div className="absolute top-20 -right-10 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50"></div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight mb-2">
              User Management 👥
            </h1>
            <p className="text-slate-400 font-bold uppercase text-xs tracking-[0.2em]">Cari dan kelola hak akses pengguna sistem.</p>
          </div>

          <div className="bg-slate-50 p-2 rounded-full border border-slate-100 flex items-center w-full max-w-sm shadow-inner transition-all focus-within:ring-4 focus-within:ring-indigo-100 focus-within:border-indigo-200 focus-within:bg-white">
            <span className="pl-4 pr-2">🔍</span>
            <input
              className="flex-1 bg-transparent px-2 py-2 outline-none font-bold text-slate-700 text-sm placeholder:font-semibold placeholder:text-slate-300"
              placeholder="Cari nama atau email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-400">
                <tr>
                  <th className="py-6 px-8 font-black uppercase tracking-widest text-[10px] text-center">Photo</th>
                  <th className="py-6 px-4 font-black uppercase tracking-widest text-[10px]">Identitas Pengguna</th>
                  <th className="py-6 px-4 font-black uppercase tracking-widest text-[10px]">Akses Sistem (Role)</th>
                  <th className="py-6 px-8 font-black uppercase tracking-widest text-[10px] text-right">Tindakan</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-20 font-bold text-slate-300 italic text-lg">Tidak ada user ditemukan 🏜️</td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-5 px-8 text-center">
                        {user.photoUrl ? (
                          <img src={user.photoUrl} className="w-14 h-14 rounded-2xl mx-auto object-cover border-4 border-white shadow-sm transition-transform group-hover:scale-110" alt="Avatar" />
                        ) : (
                          <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-2xl mx-auto flex items-center justify-center font-black text-xl shadow-inner uppercase">
                            {user.name.charAt(0)}
                          </div>
                        )}
                      </td>

                      <td className="py-5 px-4">
                        <p className="font-black text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">{user.name}</p>
                        <p className="text-slate-400 font-bold text-sm">{user.email}</p>
                      </td>

                      <td className="py-5 px-4">
                        <select
                          value={user.role}
                          onChange={(e) => changeRole(user.id, e.target.value)}
                          className="bg-slate-50 border-2 border-slate-100 text-slate-700 px-5 py-2.5 rounded-full font-black outline-none hover:bg-white hover:border-indigo-300 transition-all cursor-pointer text-xs"
                        >
                          <option value="STUDENT">🎓 STUDENT</option>
                          <option value="TEACHER">👩‍🏫 TEACHER</option>
                          <option value="ADMIN">🛡️ ADMIN</option>
                        </select>
                      </td>

                      <td className="py-5 px-8 text-right">
                        <button
                          className="bg-white border-2 border-slate-100 text-rose-500 hover:bg-rose-500 hover:text-white hover:border-rose-500 px-6 py-2.5 rounded-full font-black text-xs transition-all shadow-sm active:scale-95"
                          onClick={() => removeUser(user.id)}
                        >
                          Hapus User
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}