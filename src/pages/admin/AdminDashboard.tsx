import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import api from "../services/api";
import { Loader2 } from "lucide-react";
import socket from "../../hooks/useSocket";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quotaData, setQuotaData] = useState<{
    dailyHits: number;
    usagePercent: number;
    warningThreshold: number;
    criticalThreshold: number;
    status: "NORMAL" | "WARNING" | "CRITICAL";
    date: string;
  } | null>(null);

  // ✅ FE-NEW-06: Fungsi fetch dipisah agar bisa dipanggil ulang
  async function fetchStats() {
    try {
      const response = await api.get("/analytics/admin/stats");
      if (response.data.status === "success") {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data admin:", error);
    } finally {
      setLoading(false);
    }
  }

  // ✅ AI-09: Fetch quota status AI
  async function fetchQuotaStatus() {
    try {
      const response = await api.get("/ai/quota-status");
      if (response.data.success) {
        setQuotaData(response.data.data);
      }
    } catch (error) {
      // Quota endpoint mungkin tidak tersedia di semua environment, abaikan error
      console.warn("Quota status tidak tersedia:", error);
    }
  }

  useEffect(() => {
    fetchStats();
    fetchQuotaStatus();
  }, []);

  // ✅ FE-NEW-06: Auto-refetch saat ada update dari Telegram approval via socket
  useEffect(() => {
    socket.emit("join_admin_room");

    // Saat ada guru baru di-approve/reject via Telegram, stats bisa berubah
    socket.on("admin_refresh", async () => {
      console.log(
        "🔄 AdminDashboard: socket admin_refresh diterima, refetching stats...",
      );
      await fetchStats();
    });

    // Listener untuk notifikasi guru baru daftar (pendaftar baru muncul real-time)
    socket.on("new_teacher_registered", async () => {
      console.log("🔄 AdminDashboard: guru baru daftar, refetching stats...");
      await fetchStats();
    });

    return () => {
      socket.off("admin_refresh");
      socket.off("new_teacher_registered");
    };
  }, []);

  if (loading || !stats) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <Loader2 size={48} className="text-indigo-500 animate-spin" />
        <p className="font-black text-slate-400 uppercase tracking-widest text-sm">
          Memuat Data Server...
        </p>
      </div>
    );
  }

  // Helper warna untuk quota bar (AI-09)
  const getQuotaColor = (status: string) => {
    if (status === "CRITICAL")
      return {
        bar: "bg-rose-500",
        text: "text-rose-600",
        bg: "bg-rose-50",
        border: "border-rose-200",
      };
    if (status === "WARNING")
      return {
        bar: "bg-amber-500",
        text: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-200",
      };
    return {
      bar: "bg-emerald-500",
      text: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
    };
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12 pt-28 px-6 space-y-10 relative overflow-hidden">
      {/* Dekorasi Background */}
      <div className="absolute top-20 -left-10 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-30"></div>

      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
        {/* ================= HEADER BANNER ================= */}
        <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500 opacity-20 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <h1 className="text-3xl md:text-5xl font-black mb-2 tracking-tight">
              Admin Dashboard 🛡️
            </h1>
            <p className="text-slate-400 font-semibold text-lg italic">
              Pantau ringkasan sistem dan aktivitas platform WordIT secara
              real-time.
            </p>
          </div>
        </div>

        {/* ================= SYSTEM STATS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6 hover:-translate-y-2 transition-all duration-300">
            <div className="w-16 h-16 shrink-0 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl">
              👨‍👩‍👧‍👦
            </div>
            <div>
              <p className="text-slate-400 font-black text-xs uppercase tracking-widest mb-1">
                Total Users
              </p>
              <h2 className="text-4xl font-black text-slate-800">
                {stats.totalUsers}
              </h2>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6 hover:-translate-y-2 transition-all duration-300">
            <div className="w-16 h-16 shrink-0 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl">
              🎮
            </div>
            <div>
              <p className="text-slate-400 font-black text-xs uppercase tracking-widest mb-1">
                Total Games
              </p>
              <h2 className="text-4xl font-black text-slate-800">
                {stats.totalGames}
              </h2>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6 hover:-translate-y-2 transition-all duration-300">
            <div className="w-16 h-16 shrink-0 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-3xl">
              ⚡
            </div>
            <div>
              <p className="text-slate-400 font-black text-xs uppercase tracking-widest mb-1">
                Total Sessions
              </p>
              <h2 className="text-4xl font-black text-slate-800">
                {stats.totalSessions}
              </h2>
            </div>
          </div>
        </div>

        {/* ================= AI QUOTA MONITORING (AI-09) ================= */}
        {quotaData &&
          (() => {
            const colors = getQuotaColor(quotaData.status);
            return (
              <div
                className={`bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border ${colors.border}`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl">
                      🤖
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-800">
                        AI Quota Monitor
                      </h2>
                      <p className="text-sm font-bold text-slate-400">
                        Pemantauan penggunaan API AI harian (AI-09)
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest border ${colors.bg} ${colors.text} ${colors.border}`}
                  >
                    {quotaData.status === "CRITICAL"
                      ? "🚨 KRITIS"
                      : quotaData.status === "WARNING"
                        ? "⚠️ PERINGATAN"
                        : "✅ NORMAL"}
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        Penggunaan Hari Ini
                      </span>
                      <span className={`text-sm font-black ${colors.text}`}>
                        {quotaData.dailyHits.toLocaleString()} hits (
                        {quotaData.usagePercent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-3 rounded-full transition-all duration-700 ${colors.bar}`}
                        style={{
                          width: `${Math.min(quotaData.usagePercent, 100)}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-slate-300 font-bold">
                        0
                      </span>
                      <span className="text-[10px] text-amber-400 font-bold">
                        ⚠️ {quotaData.warningThreshold.toLocaleString()} (80%)
                      </span>
                      <span className="text-[10px] text-rose-400 font-bold">
                        🚨 {quotaData.criticalThreshold.toLocaleString()} (95%)
                      </span>
                    </div>
                  </div>

                  {/* Info Box */}
                  {quotaData.status !== "NORMAL" && (
                    <div
                      className={`${colors.bg} border ${colors.border} rounded-2xl p-4`}
                    >
                      <p className={`text-sm font-bold ${colors.text}`}>
                        {quotaData.status === "CRITICAL"
                          ? "🚨 Kuota hampir habis! Sistem AI mungkin akan gagal sebelum tengah malam. Pertimbangkan untuk membatasi generate kuis hingga besok."
                          : "⚠️ Penggunaan AI sudah mencapai 80% limit harian. Notifikasi Telegram telah dikirim ke admin."}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

        {/* ================= SYSTEM LOGS ================= */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-100">
          <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
            System Logs{" "}
            <span className="bg-slate-100 text-slate-400 text-xs px-3 py-1 rounded-full font-bold">
              RECENT
            </span>
          </h2>

          <div className="space-y-2">
            {stats.systemLogs.map((log: any) => (
              <div
                key={log.id}
                className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-5 hover:bg-slate-50 transition-all rounded-[1.5rem] group"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors
                    ${
                      log.action?.includes("CRITICAL")
                        ? "bg-rose-100 text-rose-500"
                        : log.action?.includes("WARNING")
                          ? "bg-amber-100 text-amber-500"
                          : log.action?.includes("AI_")
                            ? "bg-indigo-100 text-indigo-500"
                            : "bg-slate-100 text-slate-500 group-hover:bg-indigo-600 group-hover:text-white"
                    }`}
                  >
                    {log.action?.includes("CRITICAL")
                      ? "🚨"
                      : log.action?.includes("WARNING")
                        ? "⚠️"
                        : log.action?.includes("AI_")
                          ? "🤖"
                          : "📝"}
                  </div>
                  <div>
                    <p className="font-bold text-slate-700">{log.action}</p>
                    {log.details && (
                      <p className="text-xs text-slate-400">{log.details}</p>
                    )}
                    {log.userName && (
                      <p className="text-[10px] text-indigo-400 mt-1 uppercase tracking-widest font-black">
                        USER: {log.userName}
                      </p>
                    )}
                  </div>
                </div>
                <span className="bg-slate-100 text-slate-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter mt-3 sm:mt-0">
                  {formatDistanceToNow(new Date(log.createdAt), {
                    addSuffix: true,
                    locale: localeId,
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
