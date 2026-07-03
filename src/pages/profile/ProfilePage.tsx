import { useAuth } from "../../hooks/useAuth"
import { Link } from "react-router-dom"
import { getImageUrl } from "../../utils/assets"
import { useState } from "react"
import { toast } from "react-hot-toast"
import { requestSchoolAdmin, cancelSchoolAdmin } from "../../pages/services/user.service"
import ConfirmModal from "../../components/ui/ConfirmModal"
import {
  Settings, FolderOpen, BarChart2, ShieldCheck, School,
  CheckCircle2, Clock, XCircle, User, Phone, Building2
} from "lucide-react"

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [requesting, setRequesting] = useState(false)

  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmConfig({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        closeConfirm();
      },
    });
  };

  const closeConfirm = () => {
    setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
  };

  const handleRequestSchoolAdmin = async () => {
    try {
      setRequesting(true)
      const updatedUser = await requestSchoolAdmin()
      updateUser(updatedUser)
      toast.success("Permohonan Admin Sekolah berhasil dikirim!")
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Gagal mengirim permohonan")
    } finally {
      setRequesting(false)
    }
  }

  const handleCancelSchoolAdmin = () => {
    showConfirm(
      "Batalkan Status Admin Sekolah",
      "Apakah Anda yakin ingin membatalkan status Admin Sekolah? Peran Anda akan dikembalikan menjadi Teacher biasa.",
      async () => {
        try {
          setRequesting(true)
          const updatedUser = await cancelSchoolAdmin()
          updateUser(updatedUser)
          toast.success("Status Admin Sekolah dibatalkan. Peran kembali menjadi Teacher!")
        } catch (err: any) {
          toast.error(err.response?.data?.message || err.message || "Gagal membatalkan status admin")
        } finally {
          setRequesting(false)
        }
      }
    );
  }

  // Initials fallback for avatar
  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?"

  const roleLabel: Record<string, string> = {
    STUDENT: "Siswa",
    TEACHER: "Guru",
    SCHOOL_ADMIN: "Admin Sekolah",
    ADMIN: "Administrator",
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 pt-28">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="font-bold text-slate-500 animate-pulse text-sm">Memuat Profil...</p>
      </div>
    )
  }

  const maskedPhone = user?.phoneNumber
    ? user.phoneNumber.length > 8
      ? `${user.phoneNumber.slice(0, 4)}****${user.phoneNumber.slice(-4)}`
      : user.phoneNumber
    : null

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900 pt-28 pb-24 relative overflow-hidden">

      {/* Background decorations */}
      <div className="absolute top-20 -left-10 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute top-60 -right-10 w-96 h-96 bg-cyan-50 rounded-full blur-3xl opacity-60 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">

        {/* ─── AVATAR SECTION ─────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-5 mb-10">

          {/* Avatar with ring */}
          <div className="relative">
            <div className="w-36 h-36 md:w-44 md:h-44 rounded-full p-1 bg-gradient-to-br from-indigo-400 via-violet-400 to-cyan-400 shadow-2xl">
              {user?.photoUrl ? (
                <img
                  src={getImageUrl(user.photoUrl)}
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover bg-white border-4 border-white"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center border-4 border-white">
                  <span className="text-white font-black text-4xl tracking-tight">{initials}</span>
                </div>
              )}
            </div>
            {/* Status dot */}
            <span className="absolute bottom-2 right-2 w-5 h-5 bg-emerald-400 rounded-full border-2 border-white shadow-sm" title="Online" />
          </div>

          {/* Role badge */}
          <span className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-5 py-1.5 rounded-full font-black text-xs tracking-widest uppercase">
            <User size={12} />
            {roleLabel[user?.role] || user?.role}
            {user?.educationLevels && user.educationLevels.length > 0 && (
              <>
                <span className="text-indigo-200 font-bold">|</span>
                <span className="text-indigo-500 font-black">{user.educationLevels.join(", ")}</span>
              </>
            )}
          </span>
        </div>

        {/* ─── NAMA & EMAIL ───────────────────────────────────────── */}
        <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-2 tracking-tight">{user?.name}</h1>
        <p className="text-slate-400 font-semibold mb-8 text-base">{user?.email}</p>

        {/* ─── INFO CARD ─────────────────────────────────────────── */}
        <div className="max-w-sm mx-auto bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-8 text-left divide-y divide-slate-100">
          <div className="flex items-center justify-between py-3 first:pt-0">
            <span className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-wider">
              <Building2 size={13} /> Asal Sekolah
            </span>
            <span className="text-sm font-bold text-slate-700">{user?.schoolOrigin || "—"}</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-wider">
              <Phone size={13} /> No. HP
            </span>
            <span className="text-sm font-bold text-slate-700">{maskedPhone || "—"}</span>
          </div>
          <div className="flex items-center justify-between py-3 last:pb-0">
            <span className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-wider">
              <CheckCircle2 size={13} /> Status Akun
            </span>
            <span className={`inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${
              user?.approvalStatus === "APPROVED"
                ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                : "bg-amber-50 border-amber-200 text-amber-600"
            }`}>
              {user?.approvalStatus === "APPROVED"
                ? <><CheckCircle2 size={10} /> Aktif</>
                : <><Clock size={10} /> {user?.approvalStatus || "PENDING"}</>
              }
            </span>
          </div>
        </div>

        {/* ─── ACTION BUTTONS ─────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mb-14">
          <Link
            to="/settings"
            className="inline-flex items-center gap-2 bg-slate-950 text-white font-black px-10 py-3.5 rounded-full shadow-lg shadow-slate-200 hover:bg-indigo-600 hover:-translate-y-1 transition-all active:scale-95 text-sm"
          >
            <Settings size={16} />
            Pengaturan Akun
          </Link>

          {(user?.role === "TEACHER" || user?.role === "SCHOOL_ADMIN") && (
            <div className="flex flex-col items-center gap-3">
              {user?.role === "SCHOOL_ADMIN" && (
                <button
                  onClick={handleCancelSchoolAdmin}
                  disabled={requesting}
                  className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold px-10 py-3.5 rounded-full shadow-lg shadow-rose-100 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 text-sm"
                >
                  <School size={16} />
                  {requesting ? "Memproses..." : "Batalkan Status Admin Sekolah"}
                </button>
              )}

              {user?.role === "TEACHER" && (
                <>
                  {user?.adminRequestStatus === "PENDING" && (
                    <button
                      disabled
                      className="inline-flex items-center gap-2 bg-slate-100 text-slate-400 font-bold px-10 py-3.5 rounded-full border border-slate-200 cursor-not-allowed text-sm"
                    >
                      <Clock size={16} />
                      Permohonan Admin Sekolah Sedang Ditinjau
                    </button>
                  )}

                  {user?.adminRequestStatus === "REJECTED" && (
                    <div className="flex flex-col items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 text-xs text-rose-500 font-black uppercase tracking-wider bg-rose-50 px-4 py-1.5 rounded-full border border-rose-100">
                        <XCircle size={12} /> Pengajuan Sebelumnya Ditolak
                      </span>
                      <button
                        onClick={handleRequestSchoolAdmin}
                        disabled={requesting}
                        className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-10 py-3.5 rounded-full shadow-lg shadow-amber-100 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 text-sm"
                      >
                        <School size={16} />
                        {requesting ? "Mengajukan..." : "Ajukan Kembali Sebagai Admin Sekolah"}
                      </button>
                    </div>
                  )}

                  {user?.adminRequestStatus !== "PENDING" && user?.adminRequestStatus !== "REJECTED" && (
                    <button
                      onClick={handleRequestSchoolAdmin}
                      disabled={requesting}
                      className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-10 py-3.5 rounded-full shadow-lg shadow-amber-100 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 text-sm"
                    >
                      <School size={16} />
                      {requesting ? "Mengajukan..." : "Ajukan Sebagai Admin Sekolah"}
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* ─── QUICK ACCESS CARDS ────────────────────────────────── */}
        <div className="grid grid-cols-1 max-w-sm mx-auto w-full gap-4 text-left">
          {user?.role === "TEACHER" && (
            <Link
              to="/teacher/projects"
              className="bg-white p-7 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group flex items-center gap-5"
            >
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <FolderOpen size={26} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800 mb-0.5">My Projects</h3>
                <p className="text-slate-500 font-semibold text-xs leading-relaxed">Kelola game, aktivitas belajar, dan resource buatan Anda.</p>
              </div>
            </Link>
          )}

          {user?.role === "STUDENT" && (
            <Link
              to="/student/dashboard"
              className="bg-white p-7 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group flex items-center gap-5"
            >
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <BarChart2 size={26} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800 mb-0.5">My Results</h3>
                <p className="text-slate-500 font-semibold text-xs leading-relaxed">Riwayat game, skor pencapaian, dan progres belajar Anda.</p>
              </div>
            </Link>
          )}

          {user?.role === "ADMIN" && (
            <Link
              to="/admin/dashboard"
              className="bg-white p-7 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group flex items-center gap-5"
            >
              <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <ShieldCheck size={26} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800 mb-0.5">Admin Area</h3>
                <p className="text-slate-500 font-semibold text-xs leading-relaxed">Monitor performa sistem, statistik aplikasi, dan server logs.</p>
              </div>
            </Link>
          )}
        </div>

      </div>

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onCancel={closeConfirm}
      />
    </div>
  )
}