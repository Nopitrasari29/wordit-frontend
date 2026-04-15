import { useAuth } from "../../hooks/useAuth"
import { Link } from "react-router-dom"

export default function ProfilePage() {

  const { user } = useAuth()

  if (!user) {
    return <p>Loading...</p>
  }

  return (

    <div className="max-w-4xl mx-auto space-y-8">

      <h1 className="text-2xl font-bold">
        My Profile
      </h1>

      <div className="flex items-center gap-6">

        <img
          src={user?.photoUrl || "/avatar.png"}
          className="w-24 h-24 rounded-full object-cover"
        />

        <div>

          <p className="text-lg font-semibold">
            {user?.name}
          </p>

          <p className="text-gray-500">
            {user?.email}
          </p>

          <p className="text-sm text-indigo-600">
            {user?.role}
          </p>

        </div>

      </div>

      <div className="grid grid-cols-2 gap-4">

        <Link
          to="/teacher/projects"
          className="border rounded-lg p-6 hover:bg-gray-50"
        >
          <h3 className="font-semibold">
            My Projects
          </h3>

          <p className="text-sm text-gray-500">
            Manage created games
          </p>

        </Link>

        <Link
          to="/student/dashboard"
          className="border rounded-lg p-6 hover:bg-gray-50"
        >
          <h3 className="font-semibold">
            My Results
          </h3>

          <p className="text-sm text-gray-500">
            View game history
          </p>

        </Link>

      </div>

      <Link
        to="/profile/edit"
        className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg"
      >
        Edit Profile
      </Link>

    </div>

  )

}