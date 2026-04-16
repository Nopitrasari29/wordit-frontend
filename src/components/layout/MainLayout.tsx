import { Outlet, useLocation } from "react-router-dom"
import Navbar from "./Navbar"
import Footer from "./Footer"

export default function MainLayout() {
    const location = useLocation();

    // Halaman yang butuh tampilan Full-Width (tanpa container putih di pinggir)
    const isStandalonePage =
        location.pathname === "/" ||
        location.pathname === "/login" ||
        location.pathname === "/register" ||
        location.pathname === "/forgot-password" ||
        location.pathname === "/student/join" ||
        location.pathname === "/profile" ||
        location.pathname === "/profile/edit" ||
        location.pathname === "/teacher/projects" ||
        location.pathname.startsWith("/teacher/create") ||
        location.pathname.startsWith("/teacher/edit") ||
        location.pathname === "/admin/dashboard" ||
        location.pathname === "/admin/users";

    // Khusus Landing Page tidak pakai padding atas agar Hero terlihat menyatu
    const isHeroPage = location.pathname === "/";

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />

            <main
                className={`flex-1 w-full 
                    ${isHeroPage ? "" : "pt-28"} 
                    ${isStandalonePage ? "" : "max-w-7xl mx-auto px-6 py-8"}`}
            >
                <Outlet />
            </main>

            <Footer />
        </div>
    )
}