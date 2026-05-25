import { useState, useEffect } from "react";
import api from "../services/api";
import { Loader2 } from "lucide-react";
import socket from "../../hooks/useSocket";

const TEMPLATE_ICONS: Record<string, string> = {
  ANAGRAM: "🔤",
  FLASHCARD: "🃏",
  HANGMAN: "🎯",
  WORD_SEARCH: "🔍",
  MAZE_CHASE: "🌀",
  SPIN_THE_WHEEL: "🎡",
  MULTIPLE_CHOICE: "✅",
  TRUE_FALSE: "⚖️",
  MATCHING: "🔗",
  ESSAY: "📝",
};

const TEMPLATE_LABELS: Record<string, string> = {
  ANAGRAM: "Anagram",
  FLASHCARD: "Flashcard",
  HANGMAN: "Hangman",
  WORD_SEARCH: "Word Search",
  MAZE_CHASE: "Maze Chase",
  SPIN_THE_WHEEL: "Spin The Wheel",
  MULTIPLE_CHOICE: "Multiple Choice",
  TRUE_FALSE: "True/False",
  MATCHING: "Matching",
  ESSAY: "Essay",
};

const LEVEL_COLORS: Record<string, { bar: string; badge: string; text: string }> = {
  SD: {
    bar: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-600",
    text: "text-emerald-600",
  },
  SMP: {
    bar: "bg-blue-500",
    badge: "bg-blue-50 text-blue-600",
    text: "text-blue-600",
  },
  SMA: {
    bar: "bg-purple-500",
    badge: "bg-purple-50 text-purple-600",
    text: "text-purple-600",
  },
  UNIVERSITY: {
    bar: "bg-indigo-600",
    badge: "bg-indigo-50 text-indigo-600",
    text: "text-indigo-600",
  },
};

const LEVEL_ICONS: Record<string, string> = {
  SD: "🧒",
  SMP: "📘",
  SMA: "🎒",
  UNIVERSITY: "🎓",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function fetchStats() {
    try {
      const res = await api.get("/analytics/admin/stats");
      if (res.data.status === "success") setStats(res.data.data);
    } catch (e) {
      console.error("Gagal mengambil data admin:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    socket.emit("join_admin_room");

    const handleRefresh = async () => {
      await fetchStats();
    };

    socket.on("admin_refresh", handleRefresh);
    socket.on("new_teacher_registered", handleRefresh);

    return () => {
      socket.off("admin_refresh", handleRefresh);
      socket.off("new_teacher_registered", handleRefresh);
    };
  }, []);

  if (loading || !stats) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 size={40} className="text-indigo-600 animate-spin" />
        <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">
          Memuat Data Analytics...
        </p>
      </div>
    );
  }

  const maxPlayCount = Math.max(
    ...(stats.topGames || []).map((g: any) => g.playCount || 0),
    1
  );
  const maxTemplate = Math.max(
    ...(stats.templateDistribution || []).map((t: any) => t.count || 0),
    1
  );
  const maxLevel = Math.max(
    ...(stats.levelDistribution || []).map((l: any) => l.count || 0),
    1
  );
  const totalLevel = (stats.levelDistribution || []).reduce(
    (a: number, l: any) => a + l.count,
    0
  );
  const max7Days = Math.max(
    ...(stats.last7DaysSessions || []).map((d: any) => d.count || 0),
    1
  );

  return (
    <div className="space-y-8">
      {/* ─── SECTION 1: OVERVIEW CARDS ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Users */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:-translate-y-1 transition-all duration-300">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-xl mb-3">
            👨‍👩‍👧‍👦
          </div>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider mb-0.5">
            Total User
          </p>
          <h3 className="text-2xl font-black text-slate-800">
            {stats.totalUsers}
          </h3>
        </div>

        {/* Card 2: Total Students */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:-translate-y-1 transition-all duration-300">
          <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center text-xl mb-3">
            🎓
          </div>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider mb-0.5">
            Total Siswa
          </p>
          <h3 className="text-2xl font-black text-slate-800">
            {stats.totalStudents ?? 0}
          </h3>
        </div>

        {/* Card 3: Guru Approved */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-xl mb-3">
            ✅
          </div>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider mb-0.5">
            Guru Approved
          </p>
          <h3 className="text-2xl font-black text-slate-800">
            {stats.teachers?.approved ?? 0}
          </h3>
          {(stats.teachers?.pending ?? 0) > 0 && (
            <div className="mt-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[10px] font-bold text-amber-600">
                {stats.teachers.pending} pending
              </span>
            </div>
          )}
        </div>

        {/* Card 4: Guru Pending */}
        <div
          className={`bg-white p-5 rounded-2xl shadow-sm hover:-translate-y-1 transition-all duration-300 relative overflow-hidden ${
            (stats.teachers?.pending ?? 0) > 0
              ? "border border-amber-200"
              : "border border-slate-100"
          }`}
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${
              (stats.teachers?.pending ?? 0) > 0
                ? "bg-amber-50 text-amber-500"
                : "bg-slate-50 text-slate-400"
            }`}
          >
            ⏳
          </div>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider mb-0.5">
            Guru Pending
          </p>
          <h3
            className={`text-2xl font-black ${
              (stats.teachers?.pending ?? 0) > 0
                ? "text-amber-500"
                : "text-slate-400"
            }`}
          >
            {stats.teachers?.pending ?? 0}
          </h3>
        </div>
      </div>

      {/* ─── COMPONENT: USER RATIO COMPARISON split bar ─── */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-sm transition-all duration-300">
        <div className="flex-1">
          <h4 className="text-sm font-black text-slate-800 mb-1">Sebaran Pengguna Platform</h4>
          <p className="text-xs text-slate-400 font-semibold">Komparasi sebaran Siswa dengan Guru di platform WordIT</p>
        </div>
        <div className="flex items-center gap-6 shrink-0 w-full md:w-auto">
          {/* Split Bar */}
          <div className="flex-1 md:w-80 space-y-1.5">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-slate-400">
              <span>Siswa ({stats.totalStudents ?? 0})</span>
              <span>Guru ({stats.teachers?.approved ?? 0})</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 flex overflow-hidden border border-slate-200/30 p-0.5">
              <div
                className="bg-indigo-600 h-full rounded-l-full transition-all duration-1000"
                style={{
                  width: `${
                    stats.totalUsers > 0
                      ? ((stats.totalStudents ?? 0) / stats.totalUsers) * 100
                      : 50
                  }%`,
                }}
                title="Siswa"
              />
              <div
                className="bg-emerald-500 h-full rounded-r-full transition-all duration-1000"
                style={{
                  width: `${
                    stats.totalUsers > 0
                      ? (((stats.teachers?.approved ?? 0) + (stats.teachers?.pending ?? 0)) / stats.totalUsers) * 100
                      : 50
                  }%`,
                }}
                title="Guru"
              />
            </div>
          </div>
          {/* Percentage Badge */}
          <div className="bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-2xl text-center shrink-0">
            <span className="text-base font-black text-indigo-600">
              {stats.totalUsers > 0 && stats.totalStudents > 0
                ? `${Math.round(((stats.totalStudents ?? 0) / stats.totalUsers) * 100)}%`
                : "0%"}
            </span>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mt-0.5">Siswa</p>
          </div>
        </div>
      </div>

      {/* ─── SECTION 2: GAME STATS CARDS ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Published Games */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-xl">
              🌐
            </div>
            <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              PUBLISHED
            </span>
          </div>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider mb-0.5">
            Game Published
          </p>
          <h3 className="text-3xl font-black text-indigo-600">
            {stats.games?.published ?? 0}
          </h3>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1">
            <div
              className="bg-indigo-600 h-1 rounded-full transition-all duration-700"
              style={{
                width: `${
                  stats.games?.total
                    ? (stats.games.published / stats.games.total) * 100
                    : 0
                }%`,
              }}
            />
          </div>
          <p className="text-[10px] text-slate-400 font-bold mt-1.5">
            {stats.games?.total
              ? Math.round((stats.games.published / stats.games.total) * 100)
              : 0}
            % dari total {stats.games?.total ?? 0} game
          </p>
        </div>

        {/* Card 2: Draft Games */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-slate-50 text-slate-500 rounded-xl flex items-center justify-center text-xl">
              📋
            </div>
            <span className="bg-slate-50 text-slate-500 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              DRAFT
            </span>
          </div>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider mb-0.5">
            Game Draft
          </p>
          <h3 className="text-3xl font-black text-slate-600">
            {stats.games?.draft ?? 0}
          </h3>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1">
            <div
              className="bg-slate-400 h-1 rounded-full transition-all duration-700"
              style={{
                width: `${
                  stats.games?.total
                    ? (stats.games.draft / stats.games.total) * 100
                    : 0
                }%`,
              }}
            />
          </div>
          <p className="text-[10px] text-slate-400 font-bold mt-1.5">
            {stats.games?.total
              ? Math.round((stats.games.draft / stats.games.total) * 100)
              : 0}
            % dari total {stats.games?.total ?? 0} game
          </p>
        </div>

        {/* Card 3: Total Sessions */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center text-xl">
              🎮
            </div>
            <span className="bg-blue-50 text-blue-500 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              COMPLETED
            </span>
          </div>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider mb-0.5">
            Total Sesi Dimainkan
          </p>
          <h3 className="text-3xl font-black text-blue-500">
            {stats.totalSessions}
          </h3>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1" />
          <p className="text-[10px] text-slate-400 font-bold mt-1.5">
            Total sesi kuis LTI & standalone
          </p>
        </div>
      </div>

      {/* ─── SECTION 3: TOP GAMES + TEMPLATE DIST ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TOP 5 GAMES */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-5 border-b border-slate-50 pb-4">
            <div className="w-9 h-9 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center text-lg">
              🏆
            </div>
            <div>
              <h2 className="text-md font-black text-slate-800">
                Top 5 Game Terpopuler
              </h2>
              <p className="text-[11px] text-slate-400 font-bold">
                Berdasarkan jumlah dimainkan
              </p>
            </div>
          </div>
          {stats.topGames?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <span className="text-3xl mb-2">🎮</span>
              <p className="text-slate-400 font-bold text-xs">
                Belum ada game yang dimainkan
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.topGames?.map((game: any, idx: number) => (
                <div key={game.id} className="flex items-center gap-4">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                      idx === 0
                        ? "bg-amber-400 text-white"
                        : idx === 1
                        ? "bg-slate-300 text-slate-700"
                        : idx === 2
                        ? "bg-orange-300 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-sm truncate">
                      {game.title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span className="text-[10px] text-slate-400 font-bold">
                        {game.creatorName}
                      </span>
                      <span className="text-slate-300 text-[10px] font-bold">•</span>
                      <span className="text-[10px] text-indigo-600 font-bold">
                        {TEMPLATE_ICONS[game.templateType] || "🎮"}{" "}
                        {TEMPLATE_LABELS[game.templateType] || game.templateType}
                      </span>
                    </div>
                    <div className="mt-1.5 w-full bg-slate-100 rounded-full h-1">
                      <div
                        className={`h-1 rounded-full transition-all duration-700 ${
                          idx === 0
                            ? "bg-amber-400"
                            : idx === 1
                            ? "bg-slate-400"
                            : idx === 2
                            ? "bg-orange-300"
                            : "bg-indigo-500"
                        }`}
                        style={{ width: `${(game.playCount / maxPlayCount) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-slate-800 text-sm">
                      {game.playCount}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold">
                      plays
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TEMPLATE DISTRIBUTION */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-5 border-b border-slate-50 pb-4">
            <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-lg">
              📊
            </div>
            <div>
              <h2 className="text-md font-black text-slate-800">
                Distribusi Template Game
              </h2>
              <p className="text-[11px] text-slate-400 font-bold">
                Jumlah game per jenis template
              </p>
            </div>
          </div>
          {stats.templateDistribution?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <span className="text-3xl mb-2">📋</span>
              <p className="text-slate-400 font-bold text-xs">
                Belum ada game yang dibuat
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {stats.templateDistribution?.map((t: any) => (
                <div key={t.templateType} className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center text-sm shrink-0">
                    {TEMPLATE_ICONS[t.templateType] || "🎮"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-slate-700 truncate">
                        {TEMPLATE_LABELS[t.templateType] || t.templateType}
                      </span>
                      <span className="text-xs font-bold text-indigo-600 ml-2 shrink-0">
                        {t.count}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div
                        className="bg-indigo-600 h-1.5 rounded-full transition-all duration-700"
                        style={{ width: `${(t.count / maxTemplate) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── SECTION 4: TREN 7 HARI ─── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-5 border-b border-slate-50 pb-4">
          <div className="w-9 h-9 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center text-lg">
            📈
          </div>
          <div>
            <h2 className="text-md font-black text-slate-800">
              Tren Sesi 7 Hari Terakhir
            </h2>
            <p className="text-[11px] text-slate-400 font-bold">
              Jumlah kuis yang selesai dimainkan per hari
            </p>
          </div>
        </div>
        {stats.last7DaysSessions?.every((d: any) => d.count === 0) ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <span className="text-3xl mb-2">📊</span>
            <p className="text-slate-400 font-bold text-xs">
              Belum ada sesi dalam 7 hari terakhir
            </p>
          </div>
        ) : (
          <div className="flex items-end gap-3 mt-4" style={{ height: "130px" }}>
            {(stats.last7DaysSessions || []).map((day: any, idx: number) => {
              const heightPct = Math.max(
                day.count > 0 ? (day.count / max7Days) * 100 : 0,
                day.count > 0 ? 5 : 0
              );
              const isToday = idx === stats.last7DaysSessions.length - 1;
              return (
                <div
                  key={day.date}
                  className="flex-1 flex flex-col items-center gap-1.5 group"
                >
                  <span
                    className={`text-[10px] font-black transition-colors ${
                      day.count > 0
                        ? isToday
                          ? "text-indigo-600"
                          : "text-slate-500"
                        : "text-transparent"
                    }`}
                  >
                    {day.count > 0 ? day.count : "0"}
                  </span>
                  <div className="w-full flex items-end justify-center flex-1">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-700 hover:opacity-90 cursor-default ${
                        isToday
                          ? "bg-indigo-600 shadow-md shadow-indigo-100"
                          : "bg-blue-300"
                      }`}
                      style={{
                        height: `${heightPct}%`,
                        minHeight: day.count > 0 ? "6px" : "2px",
                      }}
                      title={`${day.date}: ${day.count} sesi`}
                    />
                  </div>
                  <span
                    className={`text-[9px] font-black tracking-tight ${
                      isToday ? "text-indigo-600" : "text-slate-400"
                    }`}
                  >
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── SECTION 5: TOP GURU + LEVEL DIST ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TOP 5 GURU AKTIF */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-5 border-b border-slate-50 pb-4">
            <div className="w-9 h-9 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center text-lg">
              👨‍🏫
            </div>
            <div>
              <h2 className="text-md font-black text-slate-800">
                Guru Paling Aktif
              </h2>
              <p className="text-[11px] text-slate-400 font-bold">
                Berdasarkan jumlah game yang dibuat
              </p>
            </div>
          </div>
          {stats.topTeachers?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <span className="text-3xl mb-2">👨‍🏫</span>
              <p className="text-slate-400 font-bold text-xs">
                Belum ada guru yang aktif
              </p>
            </div>
          ) : (
            <div className="space-y-4.5">
              {(stats.topTeachers || []).map((teacher: any, idx: number) => {
                const maxGames = Math.max(
                  ...(stats.topTeachers || []).map((t: any) => t.gameCount),
                  1
                );
                return (
                  <div key={teacher.id} className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                        idx === 0
                          ? "bg-amber-400 text-white"
                          : idx === 1
                          ? "bg-slate-300 text-slate-700"
                          : idx === 2
                          ? "bg-orange-300 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-bold text-slate-800 text-sm truncate">
                          {teacher.name}
                        </p>
                        <span className="text-xs font-black text-emerald-600 ml-2 shrink-0">
                          {teacher.gameCount} game
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mb-1.5 flex-wrap">
                        {(teacher.educationLevels || []).slice(0, 3).map((lvl: string) => (
                          <span
                            key={lvl}
                            className="bg-slate-50 text-slate-400 border border-slate-100 text-[9px] font-bold px-1.5 py-0.5 rounded-md"
                          >
                            {lvl}
                          </span>
                        ))}
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1">
                        <div
                          className="bg-emerald-500 h-1 rounded-full transition-all duration-700"
                          style={{
                            width: `${(teacher.gameCount / maxGames) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* DISTRIBUSI PER JENJANG */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-5 border-b border-slate-50 pb-4">
            <div className="w-9 h-9 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center text-lg">
              🏫
            </div>
            <div>
              <h2 className="text-md font-black text-slate-800">
                Game per Jenjang Pendidikan
              </h2>
              <p className="text-[11px] text-slate-400 font-bold">
                Distribusi konten berdasarkan jenjang
              </p>
            </div>
          </div>
          {stats.levelDistribution?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <span className="text-3xl mb-2">🏫</span>
              <p className="text-slate-400 font-bold text-xs">
                Belum ada data jenjang
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {(stats.levelDistribution || []).map((l: any) => {
                const colors = LEVEL_COLORS[l.level] || {
                  bar: "bg-slate-300",
                  badge: "bg-slate-50 text-slate-500",
                  text: "text-slate-600",
                };
                return (
                  <div key={l.level} className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 ${colors.badge}`}
                    >
                      {LEVEL_ICONS[l.level] || "🎓"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-slate-700">
                          {l.level}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-bold ${colors.text}`}>
                            {l.count} game
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold">
                            ({totalLevel > 0 ? Math.round((l.count / totalLevel) * 100) : 0}%)
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className={`${colors.bar} h-2 rounded-full transition-all duration-700`}
                          style={{ width: `${(l.count / maxLevel) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="mt-1 pt-3.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                <span className="text-slate-400">Total dari semua jenjang</span>
                <span className="text-slate-700">{totalLevel} game</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
