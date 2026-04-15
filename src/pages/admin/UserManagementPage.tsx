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

  if (loading) {

    return <p className="p-10">Loading users...</p>

  }

  return (

    <div className="max-w-7xl mx-auto px-6 py-10">

      <h1 className="text-3xl font-bold mb-8">
        User Management
      </h1>

      {/* SEARCH */}

      <input
        className="border px-4 py-2 mb-6 w-full max-w-md rounded"
        placeholder="Search user..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* TABLE */}

      <div className="overflow-x-auto">

        <table className="w-full border">

          <thead className="bg-gray-100">

            <tr>

              <th className="p-3 border">Photo</th>
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Email</th>
              <th className="p-3 border">Role</th>
              <th className="p-3 border">Actions</th>

            </tr>

          </thead>

          <tbody>

            {filteredUsers.map((user) => (

              <tr key={user.id} className="text-center">

                <td className="border p-3">

                  {user.photoUrl ? (

                    <img
                      src={user.photoUrl}
                      className="w-10 h-10 rounded-full mx-auto"
                    />

                  ) : (

                    "—"

                  )}

                </td>

                <td className="border p-3">
                  {user.name}
                </td>

                <td className="border p-3">
                  {user.email}
                </td>

                <td className="border p-3">

                  <select
                    value={user.role}
                    onChange={(e) => changeRole(user.id, e.target.value)}
                    className="border px-2 py-1 rounded"
                  >

                    <option value="STUDENT">STUDENT</option>
                    <option value="TEACHER">TEACHER</option>
                    <option value="ADMIN">ADMIN</option>

                  </select>

                </td>

                <td className="border p-3">

                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded"
                    onClick={() => removeUser(user.id)}
                  >
                    Delete
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  )

}