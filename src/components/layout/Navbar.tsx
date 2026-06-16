import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState, useRef, useEffect } from "react";
import { getImageUrl } from "../../utils/assets";
import api from "../../pages/services/api";
import socket from "../../hooks/useSocket";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ✅ FE-NEW-07: State untuk badge PENDING count di menu Users
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ FE-NEW-07: Fetch jumlah user PENDING jika role ADMIN
  useEffect(() => {
    if (user?.role !== "ADMIN") return;

    async function fetchPendingCount() {
      try {
        const response = await api.get("/users");
        const userData = Array.isArray(response.data)
          ? response.data
          : response.data?.data;
        if (Array.isArray(userData)) {
          const count = userData.filter(
            (u: any) => u.approvalStatus === "PENDING",
          ).length;
          setPendingCount(count);
        }
      } catch (err) {
        // Abaikan error, badge tidak kritis
        console.warn("Tidak bisa fetch pending count:", err);
      }
    }

    fetchPendingCount();

    // ✅ FE-NEW-07: Update badge secara real-time via socket
    socket.emit("join_admin_room");

    socket.on("admin_refresh", () => {
      fetchPendingCount();
    });

    socket.on("new_teacher_registered", () => {
      // Langsung tambah badge +1 saat ada guru baru daftar (optimistic update)
      setPendingCount((prev) => prev + 1);
    });

    return () => {
      socket.off("admin_refresh");
      socket.off("new_teacher_registered");
    };
  }, [user?.role]);

  return (
    <div className="fixed top-6 left-0 w-full z-50 flex justify-center px-4 font-sans pointer-events-none">
      <nav className="bg-white/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white px-6 py-3.5 rounded-full flex items-center justify-between w-full max-w-6xl transition-all pointer-events-auto">
        {/* LOGO */}
        <Link
          to="/"
          className="flex items-center hover:scale-105 transition-transform"
        >
          <img
            src="/4.svg"
            className="h-10 md:h-12 object-contain"
            alt="WordIT Logo"
          />
        </Link>

        {/* MENU TENGAH */}
        <div className="hidden md:flex items-center gap-6 font-bold text-slate-500">
          {user?.role !== "ADMIN" && (
            <Link
              to="/explore"
              className="hover:text-indigo-600 transition-colors"
            >
              Explore
            </Link>
          )}

          {user?.role === "STUDENT" && (
            <>
              <Link
                to="/student/dashboard"
                className="hover:text-indigo-600 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/student/join"
                className="hover:text-indigo-600 transition-colors"
              >
                Join Game
              </Link>
            </>
          )}

          {user?.role === "TEACHER" && (
            <>
              <Link
                to="/teacher/dashboard"
                className="hover:text-indigo-600 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/teacher/projects"
                className="hover:text-indigo-600 transition-colors"
              >
                My Projects
              </Link>
            </>
          )}

          {user?.role === "ADMIN" && (
            <>
              <Link
                to="/admin/dashboard"
                className="hover:text-indigo-600 transition-colors"
              >
                Admin
              </Link>

              {/* ✅ FE-NEW-07: Link Users dengan badge PENDING */}
              <Link
                to="/admin/users"
                className="relative hover:text-indigo-600 transition-colors flex items-center gap-1"
              >
                Users
                {pendingCount > 0 && (
                  <span className="absolute -top-2 -right-4 min-w-[18px] h-[18px] bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 shadow-md shadow-rose-200 animate-pulse">
                    {pendingCount > 99 ? "99+" : pendingCount}
                  </span>
                )}
              </Link>
            </>
          )}
        </div>

        {/* MENU KANAN (AUTH/PROFILE) */}
        <div className="flex items-center gap-4">
          {!user && (
            <>
              <Link
                to="/login"
                className="text-slate-600 font-bold hover:text-indigo-600 hidden sm:block"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-full font-black shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-1 transition-all"
              >
                Register
              </Link>
            </>
          )}

          {user && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2 py-1.5 pr-4 rounded-full transition-colors"
              >
                <img
                  src={getImageUrl(user.photoUrl) || "/avatar.png"}
                  className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm bg-indigo-100"
                  alt="Avatar"
                />
                <span className="font-bold text-slate-700 text-sm hidden sm:block">
                  {user.name}
                </span>
                <span className="text-xs text-slate-400">▼</span>
              </button>

              {open && (
                <div className="absolute right-0 mt-3 w-52 bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-2">
                    <Link
                      to="/profile"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-50 transition-colors"
                    >
                      <span className="text-lg">👤</span>
                      <span className="font-bold text-slate-700 text-sm">
                        Edit Profil
                      </span>
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-rose-50 transition-colors group"
                    >
                      <span className="text-lg">🚪</span>
                      <span className="font-bold text-slate-700 group-hover:text-rose-600 text-sm transition-colors">
                        Logout
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}
