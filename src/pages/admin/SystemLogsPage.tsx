import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import api from "../services/api";
import { Loader2, RefreshCw, Download } from "lucide-react";
import socket from "../../hooks/useSocket";
import { toast } from "react-hot-toast";

export default function SystemLogsPage() {
  const [quotaData, setQuotaData] = useState<{
    dailyHits: number;
    usagePercent: number;
    warningThreshold: number;
    criticalThreshold: number;
    status: "NORMAL" | "WARNING" | "CRITICAL";
    date: string;
  } | null>(null);

  const [logs, setLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterAction, setFilterAction] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [limit, setLimit] = useState(10);
  const [timeRange, setTimeRange] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const handleExportCSV = async () => {
    try {
      toast.loading("Menyiapkan data ekspor...");
      const res = await api.get("/analytics/admin/logs", {
        params: {
          page: 1,
          limit: 9999,
          action: filterAction || undefined,
          search: searchQuery || undefined,
          timeRange: timeRange !== "ALL" ? timeRange : undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        },
      });
      const allLogs = res.data.data.logs || [];
      if (allLogs.length === 0) {
        toast.dismiss();
        toast.error("Tidak ada log untuk diekspor!");
        return;
      }
      const headers = ["Waktu", "Aksi/Aktivitas", "Detail", "User Name", "User Email"];
      const rows = allLogs.map((l: any) => [
        new Date(l.createdAt).toLocaleString("id-ID"),
        l.action,
        l.details || "-",
        l.userName || "-",
        l.userEmail || "-",
      ]);
      const csvContent = [headers, ...rows]
        .map((e) => e.map((val: any) => `"${String(val).replace(/"/g, '""')}"`).join(","))
        .join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      const filterLabel = filterAction ? `_${filterAction.toLowerCase()}` : "";
      const dateLabel = dateFrom ? `_${dateFrom}` : "";
      link.setAttribute("download", `wordit-logs${filterLabel}${dateLabel}_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.dismiss();
      toast.success(`${allLogs.length} log berhasil diekspor ke CSV!`);
    } catch (e) {
      toast.dismiss();
      toast.error("Gagal mengekspor log!");
    }
  };
  async function fetchQuotaStatus() {
    try {
      const res = await api.get("/ai/quota-status");
      if (res.data.success) setQuotaData(res.data.data);
    } catch (e) {
      console.warn("Quota status tidak tersedia:", e);
    }
  }

  async function fetchLogs(pageNum = 1) {
    setLogsLoading(true);
    try {
      const res = await api.get("/analytics/admin/logs", {
        params: {
          page: pageNum,
          limit,
          action: filterAction || undefined,
          search: searchQuery || undefined,
          timeRange: timeRange !== "ALL" ? timeRange : undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        },
      });
      if (res.data.status === "success") {
        setLogs(res.data.data.logs);
        setPage(res.data.data.pagination.page);
        setTotalPages(res.data.data.pagination.totalPages);
      }
    } catch (e) {
      console.error("Gagal mengambil log:", e);
    } finally {
      setLogsLoading(false);
    }
  }

  useEffect(() => {
    fetchQuotaStatus();
    fetchLogs(page);
}, [page, filterAction, limit, timeRange, dateFrom, dateTo]);

  useEffect(() => {
    socket.emit("join_admin_room");
    const handleRefresh = async () => {
      await fetchQuotaStatus();
      fetchLogs(page);
    };
    socket.on("admin_refresh", handleRefresh);
    socket.on("new_teacher_registered", handleRefresh);
    return () => {
      socket.off("admin_refresh", handleRefresh);
      socket.off("new_teacher_registered", handleRefresh);
    };
  }, [page]);

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

  const handleManualRefresh = () => {
    fetchQuotaStatus();
    fetchLogs(1);
  };

  return (
    <div className="space-y-8">
      {/* ─── AI QUOTA MONITORING ─── */}
      {quotaData && (() => {
        const colors = getQuotaColor(quotaData.status);
        const remainingHits = Math.max(
          0,
          quotaData.criticalThreshold - quotaData.dailyHits
        );
        const exactPercent =
          (quotaData.dailyHits / quotaData.criticalThreshold) * 100;
        const displayPercent =
          exactPercent > 0 && exactPercent < 1
            ? exactPercent.toFixed(2)
            : Math.round(exactPercent);
        const barWidth =
          quotaData.dailyHits > 0 ? Math.max(1.5, exactPercent) : 0;
        return (
          <div
            className={`bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border ${colors.border} relative overflow-hidden`}
          >
            <div
              className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none ${
                quotaData.status === "CRITICAL"
                  ? "bg-rose-400"
                  : quotaData.status === "WARNING"
                  ? "bg-amber-400"
                  : "bg-emerald-400"
              }`}
            />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                  🤖
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                    AI Quota Engine
                    <span className="flex h-2.5 w-2.5 relative">
                      <span
                        className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                          quotaData.status === "CRITICAL"
                            ? "bg-rose-400"
                            : quotaData.status === "WARNING"
                            ? "bg-amber-400"
                            : "bg-emerald-400"
                        }`}
                      />
                      <span
                        className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                          quotaData.status === "CRITICAL"
                            ? "bg-rose-500"
                            : quotaData.status === "WARNING"
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                      />
                    </span>
                  </h2>
                  <p className="text-xs font-bold text-slate-400">
                    Pemantauan penggunaan API AI (Groq & Gemini) Hari Ini
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleManualRefresh}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition border border-slate-200"
                  title="Segarkan Data"
                >
                  <RefreshCw size={16} />
                </button>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-3 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-100 rounded-xl text-xs font-black transition-all"
                  title="Ekspor Log ke CSV"
                >
                  <Download size={14} />
                  <span>Ekspor CSV</span>
                </button>
                <span
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${colors.bg} ${colors.text} ${colors.border}`}
                >
                  {quotaData.status === "CRITICAL"
                    ? "🚨 KRITIS"
                    : quotaData.status === "WARNING"
                    ? "⚠️ PERINGATAN"
                    : "✅ NORMAL / AMAN"}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
              <div className="lg:col-span-8 space-y-4">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Kapasitas Terpakai
                    </span>
                    <span className={`text-lg font-black ${colors.text}`}>
                      {displayPercent}%{" "}
                      <span className="text-xs text-slate-400 font-bold">
                        ({quotaData.dailyHits.toLocaleString()} /{" "}
                        {quotaData.criticalThreshold.toLocaleString()} hits)
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-4 p-0.5 border border-slate-200/50 shadow-inner">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out relative ${colors.bar} shadow-sm`}
                      style={{ width: `${Math.min(barWidth, 100)}%` }}
                    >
                      <div className="absolute top-0 right-0 bottom-0 left-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                    </div>
                  </div>
                  <div className="relative w-full h-6 mt-1">
                    <div className="absolute left-[80%] -translate-x-1/2 top-0 flex flex-col items-center">
                      <span className="h-1 bg-amber-400 w-0.5" />
                      <span className="text-[9px] text-amber-500 font-bold mt-0.5">
                        80%
                      </span>
                    </div>
                    <div className="absolute left-[95%] -translate-x-1/2 top-0 flex flex-col items-center">
                      <span className="h-1 bg-rose-400 w-0.5" />
                      <span className="text-[9px] text-rose-500 font-bold mt-0.5">
                        95%
                      </span>
                    </div>
                  </div>
                </div>
                {quotaData.status !== "NORMAL" && (
                  <div
                    className={`${colors.bg} border ${colors.border} rounded-2xl p-4 flex gap-3 items-start`}
                  >
                    <div className="text-xl">
                      {quotaData.status === "CRITICAL" ? "🚨" : "⚠️"}
                    </div>
                    <div>
                      <h4 className={`text-xs font-black ${colors.text} mb-0.5`}>
                        {quotaData.status === "CRITICAL"
                          ? "Batas Kuota Kritis Terdeteksi!"
                          : "Penggunaan Kuota Melebihi Batas Normal"}
                      </h4>
                      <p className="text-[11px] font-semibold text-slate-600 leading-relaxed">
                        {quotaData.status === "CRITICAL"
                          ? "Penggunaan harian API AI telah mencapai lebih dari 95%. Penilaian esai otomatis dialihkan ke sistem kata kunci lokal."
                          : "Penggunaan sudah di atas 80%. Sistem telah mengirim notifikasi Telegram kepada administrator."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
                      Sisa Kuota Hari Ini
                    </span>
                    <span className="text-lg font-black text-slate-800 mt-0.5 block">
                      {remainingHits.toLocaleString()}{" "}
                      <span className="text-xs text-slate-400 font-bold">
                        hits
                      </span>
                    </span>
                  </div>
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                      quotaData.status === "CRITICAL"
                        ? "bg-rose-50 text-rose-500"
                        : quotaData.status === "WARNING"
                        ? "bg-amber-50 text-amber-500"
                        : "bg-emerald-50 text-emerald-500"
                    }`}
                  >
                    🛡️
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
                      Reset Kuota
                    </span>
                    <span className="text-[11px] font-black text-slate-600 mt-1 block">
                      Tengah Malam (00:00)
                    </span>
                  </div>
                  <div className="w-9 h-9 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center text-lg shrink-0">
                    🔄
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ─── SYSTEM LOGS ─── */}
      <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-100">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
              System Logs{" "}
              <span className="bg-slate-100 text-slate-400 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                MONITORING
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Pantau seluruh aktivitas user secara real-time
            </p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {/* Search Input */}
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Cari user atau detail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setPage(1);
                    fetchLogs(1);
                  }
                }}
                className="w-full sm:w-56 bg-slate-50 border border-slate-200 text-slate-700 placeholder-slate-400 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
              />
              <button
                onClick={() => {
                  setPage(1);
                  fetchLogs(1);
                }}
                className="absolute right-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-3 py-1 text-[10px] font-black transition"
              >
                Cari
              </button>
            </div>

            {/* Filter Action */}
            <select
              value={filterAction}
              onChange={(e) => {
                setFilterAction(e.target.value);
                setPage(1);
              }}
              className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold cursor-pointer"
            >
              <option value="">Semua Aktivitas</option>
              <option value="CREATE_GAME">🎮 Buat Game</option>
              <option value="UPDATE_GAME">📝 Edit Game</option>
              <option value="DELETE_GAME">🗑️ Hapus Game</option>
              <option value="TOGGLE_PUBLISH">👁️ Publish/Unpublish</option>
              <option value="FINISH_GAME">🏆 Selesai Game</option>
              <option value="LOGIN">🔑 Login</option>
              <option value="LOGOUT">🚪 Logout</option>
              <option value="REGISTER">🆕 Register</option>
              <option value="APPROVE_TEACHER">✅ Approve Guru</option>
              <option value="REJECT_TEACHER">❌ Reject Guru</option>
              <option value="CHANGE_ROLE">🔄 Ubah Role</option>
              <option value="UPDATE_PROFILE">👤 Ubah Profil</option>
              <option value="DELETE_USER">🚨 Hapus User</option>
            </select>

            {/* Filter Time */}
            <select
              value={timeRange}
              onChange={(e) => {
                setTimeRange(e.target.value);
                setPage(1);
              }}
              className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold cursor-pointer"
            >
              <option value="ALL">Semua Waktu</option>
              <option value="yesterday">Kemarin</option>
              <option value="week">Seminggu</option>
              <option value="month">Sebulan</option>
              <option value="2months">2 Bulan</option>
            </select>

            {/* Custom Date Range */}
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setTimeRange("ALL");
                  setPage(1);
                }}
                className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold cursor-pointer"
                title="Dari Tanggal"
              />
              <span className="text-slate-400 text-xs font-bold">—</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setTimeRange("ALL");
                  setPage(1);
                }}
                className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold cursor-pointer"
                title="Sampai Tanggal"
              />
            </div>

            {/* Filter Limit */}
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold cursor-pointer"
            >
              <option value={5}>5 / hal</option>
              <option value={10}>10 / hal</option>
              <option value={20}>20 / hal</option>
              <option value={50}>50 / hal</option>
            </select>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-100 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0"
              title="Ekspor Log Aktivitas ke CSV"
            >
              <Download size={14} />
              <span>Ekspor CSV</span>
            </button>

            {(filterAction ||
              searchQuery ||
              timeRange !== "ALL" ||
              dateFrom ||
              dateTo ||
              limit !== 10) && (
              <button
                onClick={() => {
                  setFilterAction("");
                  setSearchQuery("");
                  setTimeRange("ALL");
                  setDateFrom("");
                  setDateTo("");
                  setLimit(10);
                  setPage(1);
                }}
                className="text-xs text-rose-500 font-black hover:underline px-2"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {logsLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 size={36} className="text-indigo-500 animate-spin" />
            <p className="font-bold text-slate-400 text-sm">Memuat log...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-[1.5rem]">
            <p className="text-slate-400 font-bold">
              Tidak ada log aktivitas ditemukan
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {logs.map((log: any) => (
                <div
                  key={log.id}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 hover:bg-slate-50 transition-all rounded-2xl group border border-transparent hover:border-slate-100"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        log.action?.includes("CRITICAL") ||
                        log.action?.includes("DELETE") ||
                        log.action?.includes("REJECT")
                          ? "bg-rose-50 text-rose-500"
                          : log.action?.includes("WARNING")
                          ? "bg-amber-50 text-amber-500"
                          : log.action?.includes("CREATE") ||
                            log.action?.includes("APPROVE") ||
                            log.action?.includes("FINISH")
                          ? "bg-emerald-50 text-emerald-500"
                          : log.action?.includes("UPDATE") ||
                            log.action?.includes("CHANGE")
                          ? "bg-indigo-50 text-indigo-500"
                          : "bg-slate-100 text-slate-500 group-hover:bg-indigo-600 group-hover:text-white"
                      }`}
                    >
                      {log.action?.includes("CRITICAL") ? (
                        "🚨"
                      ) : log.action?.includes("DELETE") ||
                        log.action?.includes("REJECT") ? (
                        "🗑️"
                      ) : log.action?.includes("CREATE") ||
                        log.action?.includes("APPROVE") ? (
                        "✨"
                      ) : log.action?.includes("FINISH") ? (
                        "🏆"
                      ) : log.action?.includes("WARNING") ? (
                        "⚠️"
                      ) : (
                        "📝"
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-700 text-sm">
                        {log.action}
                      </p>
                      {log.details && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          {log.details}
                        </p>
                      )}
                      {log.userName && (
                        <p className="text-[10px] text-indigo-500 mt-1 uppercase tracking-widest font-black">
                          USER: {log.userName} {log.userEmail ? `(${log.userEmail})` : ""}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="bg-slate-100 text-slate-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter mt-3 sm:mt-0 max-w-max">
                    {formatDistanceToNow(new Date(log.createdAt), {
                      addSuffix: true,
                      locale: localeId,
                    })}
                  </span>
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-100">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-full text-xs hover:bg-slate-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sebelumnya
                </button>
                <span className="text-xs text-slate-500 font-bold">
                  Hal{" "}
                  <strong className="text-indigo-600 font-black">{page}</strong>{" "}
                  /{" "}
                  <strong className="text-slate-700 font-black">
                    {totalPages}
                  </strong>
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-full text-xs hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Selanjutnya
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}