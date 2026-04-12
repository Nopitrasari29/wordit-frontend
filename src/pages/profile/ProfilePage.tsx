import { Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

export default function ProfilePage() {

    const { user } = useAuth()

    return (

        <div className="max-w-xl mx-auto">

            <h1 className="text-3xl font-bold mb-6">
                Profile
            </h1>

            <div className="border p-6 rounded mb-6 bg-white shadow">

                <p className="mb-2">
                    Email: {user?.email}
                </p>

                <p className="text-gray-500 capitalize">
                    Role: {user?.role}
                </p>

            </div>

            <Link
                to="/profile/edit"
                className="bg-blue-600 text-white px-4 py-2 rounded"
            >

                Edit Profile

            </Link>

        </div>

    )

}