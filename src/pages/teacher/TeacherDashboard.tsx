import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext" // 🎯 Ambil data user login
import { getMyGames } from "../services/game.service"
import { templateIcons } from "../../data/templateIcons"
import AnalyticsClassPage from "./analytics/AnalyticsClassPage"
import socket from "../../hooks/useSocket" // 🛠️ FIX INTEGRATION: Impor hook instance socket milikmu
import api from "../services/api" // Impor instance axios/api untuk request data profil segar
import { toast } from "react-hot-toast"

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth(); // 🎯 Ambil state user dan fungsi sinkronisasi dari AuthContext
  const [games, setGames] = useState<any[]>([])
  const [, setLoading] = useState(true)

  // Ambil nama dari database, kalau kosong baru panggil "Teacher"
  const displayName = user?.name || "Teacher";

  async function loadGames() {
    try {
      setLoading(true)
      const data = await getMyGames()
      if (data && Array.isArray(data)) {
        setGames(data)
      } else {
        setGames([])
      }
    } catch (err) {
      console.error("Gagal memuat game:", err)
      setGames([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGames()
  }, [])

  // =======================================================================
  // 🛠️ FIX & REAL-TIME SINKRONISASI VIA SOCKET.IO (TOKEN REFRESH SINKRON)
  // =======================================================================
  useEffect(() => {
    // Dengarkan sinyal broadcast 'admin_refresh' dari backend saat admin mengklik tombol APPROVE
    socket.on("admin_refresh", async () => {
      try {
        console.log("📡 Menerima sinyal refresh dari Admin. Menarik sesi token terbaru...");
        
        // Tarik paket data profil datar baru beserta token segar dari backend
        const res = await api.get("/users/profile");
        
        if (res.data?.success) {
          const freshUserData = res.data.data;
          
          // 🛠️ TIMPA TOKEN LAMA: Amankan token baru pembawa hak akses "SMA" ke localStorage
          if (freshUserData?.token) {
            localStorage.setItem("token", freshUserData.token);
          }
          
          // 🎉 JALANKAN PEMBARUAN STATE GLOBAL: Kirim flat object langsung ke AuthContext
          // Layar visual, list menu drop-down pembuatan kuis otomatis langsung berkedip ganti data baru!
          updateUser(freshUserData); 
          
          toast.success("Akun Anda telah diverifikasi oleh Admin! Jenjang mengajar baru telah diaktifkan secara real-time.", {
            icon: "🎉",
            duration: 5000
          });

          // Muat ulang daftar live game projects pengajar agar up-to-date
          loadGames();
        }
      } catch (err) {
        console.error("❌ Gagal melakukan sinkronisasi otomatis profil guru:", err);
      }
    });

    return () => {
      socket.off("admin_refresh");
    };
  }, [updateUser]);

  const totalPlays = games.reduce((a, g) => a + (g.playCount || 0), 0)
  const publishedGames = games.filter(g => g.isPublished).length

  return (
    <div className="space-y-10 font-sans pb-12 pt-6">

      {/* ================= HEADER BANNER ================= */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-[2.5rem] p-8 md:p-12 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-5xl font-black mb-3 italic tracking-tighter">
              WordIT Dashboard 👋
            </h1>
            <p className="text-indigo-100 font-semibold text-lg leading-relaxed">
              Halo, {displayName}! Kelola materi pembelajaran interaktifmu dan pantau progres kuis IT-mu dalam satu layar cerdas.
            </p>
          </div>
          <Link
            to="/teacher/create/level"
            className="bg-white text-indigo-600 px-10 py-5 rounded-[2rem] font-black text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
          >
            + Buat Game Baru
          </Link>
        </div>
      </div>

      {/* ================= STATS CARDS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6 hover:-translate-y-1 transition-all group">
          <div className="w-16 h-16 shrink-0 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center text-3xl group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">🕹️</div>
          <div>
            <p className="text-slate-400 font-black text-[10px] mb-1 uppercase tracking-widest">Total Games</p>
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter">{games.length}</h2>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6 hover:-translate-y-1 transition-all group">
          <div className="w-16 h-16 shrink-0 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center text-3xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">🎮</div>
          <div>
            <p className="text-slate-400 font-black text-[10px] mb-1 uppercase tracking-widest">Global Plays</p>
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter">{totalPlays}</h2>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6 hover:-translate-y-1 transition-all group">
          <div className="w-16 h-16 shrink-0 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center text-3xl group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-inner">✅</div>
          <div>
            <p className="text-slate-400 font-black text-[10px] mb-1 uppercase tracking-widest">Published</p>
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter">{publishedGames}</h2>
          </div>
        </div>
      </div>

      {/* ================= CLASS ANALYTICS ================= */}
      <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-slate-100">
        <div className="mb-10 px-2 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-black text-slate-800 italic underline decoration-indigo-200 underline-offset-8">
              Analitik Performa Kelas 📊
            </h2>
            <p className="text-slate-400 font-bold text-xs mt-3 uppercase tracking-widest">Data Real-time Siswa</p>
          </div>
          <Link to="/teacher/class" className="text-indigo-600 font-black text-sm hover:underline italic">Manajemen Kelas ➔</Link>
        </div>
        <AnalyticsClassPage games={games} />
      </div>

      {/* ================= RECENT PROJECTS ================= */}
      <div>
        <div className="flex justify-between items-center mb-8 px-4">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight text-sans">
            Recent Projects 📂
          </h2>
          <Link to="/teacher/projects" className="text-indigo-600 font-black hover:underline tracking-tight text-sm italic">Lihat Semua Projek ➔</Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 px-2">
          {games.length === 0 ? (
            <div className="col-span-full bg-white p-12 rounded-[2.5rem] border border-slate-100 text-center shadow-sm">
              <span className="text-5xl mb-4 block">🌵</span>
              <h3 className="text-xl font-black text-slate-800">Belum Ada Projek Game</h3>
              <p className="text-slate-400 font-bold text-sm mt-2 mb-6">Buat game kuis interaktif pertamamu menggunakan bantuan AI atau manual.</p>
              <Link to="/teacher/create/level" className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 rounded-full font-black text-sm transition-all active:scale-95 shadow-lg shadow-indigo-100">
                Buat Game Baru +
              </Link>
            </div>
          ) : (
            games.slice(0, 3).map(game => (
              <div
                key={game.id}
                className="bg-white p-8 rounded-[3rem] shadow-sm hover:shadow-2xl border border-slate-100 transition-all duration-300 hover:-translate-y-2 flex flex-col relative overflow-hidden group"
              >
                <div className="bg-slate-50 rounded-[2.5rem] h-44 mb-6 flex items-center justify-center text-6xl shadow-inner relative overflow-hidden">
                  <span className="group-hover:scale-125 transition-transform duration-500 z-10">
                    {templateIcons[game.templateType] || "🧩"}
                  </span>
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${game.isPublished ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                    {game.isPublished ? 'Published' : 'Draft'}
                  </div>
                </div>

                <h3 className="text-xl font-black text-slate-800 mb-2 truncate px-2 italic">
                  {game.title}
                </h3>

                <div className="flex items-center gap-2 mb-8 px-2">
                  <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wildest">
                    {game.templateType?.replace('_', ' ')}
                  </span>
                  <span className="text-slate-300 font-black">•</span>
                  <span className="text-slate-400 font-bold text-[10px] uppercase">
                    {game.educationLevel}
                  </span>
                </div>

                <div className="mt-auto pt-6 border-t border-slate-50 flex items-center gap-3">
                  {game.isPublished ? (
                    <button
                      onClick={() => navigate(`/teacher/session/host/${game.id}`)}
                      className="flex-1 bg-indigo-600 text-white py-3 rounded-2xl font-black text-xs hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 uppercase italic"
                    >
                      Host Live 🚀
                    </button>
                  ) : (
                    <Link
                      to={`/teacher/game/edit/${game.id}`}
                      className="flex-1 bg-slate-900 text-white py-3 rounded-2xl font-black text-xs hover:bg-slate-800 text-center transition-all shadow-lg shadow-slate-100 uppercase"
                    >
                      Edit Draft
                    </Link>
                  )}

                  <Link
                    to={`/play/${game.id}`}
                    className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100"
                    title="Solo Preview"
                  >
                    🕹️
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  )
}