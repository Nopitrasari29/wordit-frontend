import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

export default function ProtectedRoute({ role }: { role?: string }) {
    const { user, loading } = useAuth()

    // Menghindari redirect saat data auth masih di-fetch
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    // Jika tidak ada user, tendang ke login
    if (!user) {
        return <Navigate to="/login" replace />
    }

    // Jika ada batasan role dan role user tidak sesuai
    if (role && user.role !== role) {
        // Redirect ke dashboard masing-masing jika salah masuk jalur
        if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />
        if (user.role === 'TEACHER') return <Navigate to="/teacher/dashboard" replace />
        return <Navigate to="/student/dashboard" replace />
    }

    return <Outlet />
}