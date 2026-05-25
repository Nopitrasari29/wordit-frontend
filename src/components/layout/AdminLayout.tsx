import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../pages/services/api";
import socket from "../../hooks/useSocket";
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  LogOut,
  Home,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [socketConnected, setSocketConnected] = useState(socket.connected);

  // Fetch pending count initially and setup socket listeners
  useEffect(() => {
    async function fetchPendingCount() {
      try {
        const response = await api.get("/users");
        const userData = Array.isArray(response.data)
          ? response.data
          : response.data?.data;
        if (Array.isArray(userData)) {
          const count = userData.filter(
            (u: any) => u.approvalStatus === "PENDING"
          ).length;
          setPendingCount(count);
        }
      } catch (err) {
        console.warn("Gagal mengambil jumlah guru pending:", err);
      }
    }

    fetchPendingCount();

    socket.emit("join_admin_room");

    const handleAdminRefresh = () => {
      fetchPendingCount();
    };

    const handleNewTeacher = () => {
      setPendingCount((prev) => prev + 1);
    };

    socket.on("admin_refresh", handleAdminRefresh);
    socket.on("new_teacher_registered", handleNewTeacher);

    // Track socket connection
    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("admin_refresh", handleAdminRefresh);
      socket.off("new_teacher_registered", handleNewTeacher);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logout berhasil");
      navigate("/login");
    } catch (e) {
      toast.error("Logout gagal");
    }
  };

  const menuItems = [
    {
      path: "/admin/dashboard",
      name: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      path: "/admin/users",
      name: "Kelola Pengguna",
      icon: Users,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    {
      path: "/admin/logs",
      name: "Log & Kuota AI",
      icon: ShieldAlert,
    },
  ];

  // Map path to screen title
  const getPageTitle = () => {
    if (location.pathname === "/admin/dashboard") return "Dashboard Overview";
    if (location.pathname === "/admin/users") return "User Management";
    if (location.pathname === "/admin/logs") return "System Logs & AI Quota";
    return "Admin Panel";
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* ─── SIDEBAR ─── */}
      <aside
        className={`bg-slate-900 text-white flex flex-col justify-between transition-all duration-300 border-r border-slate-800 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <div>
          {/* Logo Brand */}
          <div className="h-20 flex items-center justify-between px-5 border-b border-slate-800">
            <Link to="/" className="flex items-center gap-2 hover:opacity-90">
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-black text-lg shadow-inner flex-shrink-0">
                W
              </div>
              {!collapsed && (
                <span className="text-xl font-black text-white tracking-tight">
                  Word<span className="text-blue-400">IT</span>
                  <span className="text-xs text-indigo-400 font-bold ml-1 block uppercase tracking-wider text-[10px]">
                    Admin
                  </span>
                </span>
              )}
            </Link>
          </div>

          {/* Menu Items */}
          <nav className="mt-6 px-3 space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group relative ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 font-bold"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  }`}
                  title={collapsed ? item.name : undefined}
                >
                  <Icon
                    size={20}
                    className={`flex-shrink-0 ${
                      isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                    }`}
                  />
                  {!collapsed && <span className="text-sm">{item.name}</span>}

                  {/* Badge */}
                  {item.badge !== undefined && (
                    <span
                      className={`absolute right-3 top-1/2 -translate-y-1/2 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white px-1.5 border-2 border-slate-900 animate-pulse`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-slate-800 space-y-1">
          {/* Back to Home */}
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
            title={collapsed ? "Kembali ke Beranda" : undefined}
          >
            <Home size={20} className="flex-shrink-0" />
            {!collapsed && <span className="text-sm">Ke Beranda</span>}
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-rose-400 hover:text-white hover:bg-rose-500/10 transition-colors"
            title={collapsed ? "Keluar" : undefined}
          >
            <LogOut size={20} className="flex-shrink-0" />
            {!collapsed && <span className="text-sm">Keluar</span>}
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT CONTAINER ─── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-6 z-10 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors"
              aria-label="Toggle Sidebar"
            >
              {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-5">
            {/* Realtime Status Indicator */}
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold transition-colors ${
                socketConnected
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                  : "bg-rose-50 text-rose-600 border-rose-100 animate-pulse"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  socketConnected ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                }`}
              />
              <span>{socketConnected ? "Real-time Aktif" : "Menghubungkan..."}</span>
            </div>

            {/* Admin Profile */}
            <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800">{user?.name || "Admin"}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Administrator
                </p>
              </div>
              <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 text-indigo-600 font-black rounded-2xl flex items-center justify-center shadow-inner">
                {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
              </div>
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
