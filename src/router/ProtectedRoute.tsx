import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

export default function ProtectedRoute({ role }: { role?: string }) {
    const { user, loading } = useAuth()
    const location = useLocation()

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
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    // Helper: apakah user memiliki role yang cukup?
    const hasAccess = (): boolean => {
        if (!role) return true; // Tidak ada batasan role

        // SUPER_ADMIN dan SCHOOL_ADMIN bisa akses semua rute TEACHER
        if (role === "TEACHER" && (user.role === "SCHOOL_ADMIN" || user.role === "SUPER_ADMIN")) return true;
        // SUPER_ADMIN bisa akses rute SCHOOL_ADMIN
        if (role === "SCHOOL_ADMIN" && user.role === "SUPER_ADMIN") return true;
        // Semua admin lama (ADMIN) diarahkan ke SUPER_ADMIN
        if (role === "ADMIN" && (user.role === "SUPER_ADMIN" || user.role === "SCHOOL_ADMIN")) return true;

        return user.role === role;
    };

    // Jika ada batasan role dan role user tidak sesuai
    if (!hasAccess()) {
        // Redirect ke dashboard masing-masing
        if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />
        if (user.role === 'SCHOOL_ADMIN') return <Navigate to="/teacher/dashboard" replace />
        if (user.role === 'TEACHER') return <Navigate to="/teacher/dashboard" replace />
        return <Navigate to="/student/dashboard" replace />
    }

    return <Outlet />
}