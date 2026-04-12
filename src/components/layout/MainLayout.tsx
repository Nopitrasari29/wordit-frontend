import { Outlet } from "react-router-dom"
import Navbar from "./Navbar"
import Footer from "./Footer"

export default function MainLayout() {

    return (

        <div className="min-h-screen flex flex-col">

            <Navbar />

            <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">

                <Outlet />

            </main>

            <Footer />

        </div>

    )

}