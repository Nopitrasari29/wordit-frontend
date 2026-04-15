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

  if (loading) return <p className="p-10 text-center font-bold text-slate-500 font-sans pt-32">Loading users...</p>

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 pt-24 px-6">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight mb-2">
            User Management 👥
          </h1>
          <p className="text-slate-500 font-bold">Cari dan kelola hak akses pengguna sistem.</p>
        </div>

        {/* SEARCH BAR */}
        <div className="bg-white p-4 rounded-full shadow-sm border border-slate-100 flex items-center max-w-md">
          <span className="pl-4 pr-2 text-xl">🔍</span>
          <input
            className="flex-1 bg-transparent px-2 py-2 outline-none font-bold text-slate-700 placeholder:font-medium"
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* TABLE WRAPPER */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">

            <thead className="bg-slate-50 border-b-2 border-slate-100 text-slate-400">
              <tr>
                <th className="py-5 px-6 font-black uppercase tracking-widest text-sm text-center">Photo</th>
                <th className="py-5 px-6 font-black uppercase tracking-widest text-sm">Name & Email</th>
                <th className="py-5 px-6 font-black uppercase tracking-widest text-sm">Role</th>
                <th className="py-5 px-6 font-black uppercase tracking-widest text-sm text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 font-bold text-slate-400">Tidak ada user ditemukan.</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">

                    {/* PHOTO */}
                    <td className="py-4 px-6 text-center">
                      {user.photoUrl ? (
                        <img src={user.photoUrl} className="w-12 h-12 rounded-full mx-auto object-cover border-2 border-slate-100" alt="Avatar" />
                      ) : (
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-full mx-auto flex items-center justify-center font-black">
                          {user.name.charAt(0)}
                        </div>
                      )}
                    </td>

                    {/* NAME & EMAIL */}
                    <td className="py-4 px-6">
                      <p className="font-black text-slate-800 text-lg">{user.name}</p>
                      <p className="text-slate-500 font-bold text-sm">{user.email}</p>
                    </td>

                    {/* ROLE (SELECT) */}
                    <td className="py-4 px-6">
                      <select
                        value={user.role}
                        onChange={(e) => changeRole(user.id, e.target.value)}
                        className="bg-slate-100 border border-slate-200 text-slate-700 px-4 py-2 rounded-full font-bold outline-none hover:bg-slate-200 transition-colors cursor-pointer text-sm"
                      >
                        <option value="STUDENT">👨‍🎓 STUDENT</option>
                        <option value="TEACHER">👨‍🏫 TEACHER</option>
                        <option value="ADMIN">🛡️ ADMIN</option>
                      </select>
                    </td>

                    {/* ACTIONS */}
                    <td className="py-4 px-6 text-right">
                      <button
                        className="bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white px-5 py-2 rounded-full font-bold text-sm transition-all"
                        onClick={() => removeUser(user.id)}
                      >
                        Delete
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
  )
}