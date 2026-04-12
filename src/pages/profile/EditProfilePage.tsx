import { useState } from "react"

export default function EditProfilePage() {

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleSave = () => {

        console.log({
            name,
            email,
            password
        })

    }

    return (

        <div className="max-w-md mx-auto">

            <h1 className="text-3xl font-bold mb-6">
                Edit Profile
            </h1>

            <input
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border p-3 w-full mb-3 rounded"
            />

            <input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border p-3 w-full mb-3 rounded"
            />

            <input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border p-3 w-full mb-4 rounded"
            />

            <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-4 py-2 rounded w-full"
            >

                Save Changes

            </button>

        </div>

    )

}