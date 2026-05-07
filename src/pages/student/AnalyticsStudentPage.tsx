import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import ScoreChart from "../../components/analytics/ScoreChart";
import { toast } from "react-hot-toast";
import { Loader2, Clock, BookOpen } from "lucide-react";
import api from "../../pages/services/api";

// ✅ FE-19: Helper untuk format detik menjadi string waktu yang mudah dibaca
const formatStudyTime = (totalSeconds: number): string => {
  if (!totalSeconds || totalSeconds <= 0) return "0 menit";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0)
    return `${hours} jam ${minutes > 0 ? `${minutes} mnt` : ""}`.trim();
  if (minutes > 0) return `${minutes} menit`;
  return `${totalSeconds} detik`;
};

// ✅ FE-19: Helper untuk label tipe game
const templateLabel: Record<string, string> = {
  MULTIPLE_CHOICE: "Pilihan Ganda",
  TRUE_FALSE: "Benar/Salah",
  MATCHING: "Matching",
  ESSAY: "Essay",
  ANAGRAM: "Anagram",
  FLASHCARD: "Flashcard",
  HANGMAN: "Hangman",
  MAZE_CHASE: "Maze Chase",
  SPIN_THE_WHEEL: "Spin Wheel",
  WORD_SEARCH: "Word Search",
};

export default function AnalyticsStudentPage() {
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    gamesCompleted: 0,
    overallAccuracy: 0,
    totalXp: 0,
    totalTimeSpentSeconds: 0,
  });
  const [performanceData, setPerformanceData] = useState<
    { game: string; score: number }[]
  >([]);
  const [badges, setBadges] = useState<
    { name: string; icon: string; color: string; isUnlocked: boolean }[]
  >([]);
  // ✅ FE-19: State untuk riwayat kuis terakhir
  const [recentHistory, setRecentHistory] = useState<
    {
      sessionId: string;
      gameTitle: string;
      templateType: string;
      difficulty: string;
      score: number;
      accuracy: number;
      timeSpent: number;
      finishedAt: string;
    }[]
  >([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        // 🚀 Memanggil endpoint real data
        const response = await api.get("/scores/analytics/student");
        const data = response.data;

        // ✅ SINKRONISASI: Petakan data overview dari Backend
        setStats({
          gamesCompleted: data.overview.totalGamesPlayed || 0,
          overallAccuracy: data.overview.averageAccuracy || 0,
          totalXp: data.overview.totalXp || 0, // Diambil dari hasil _sum di Backend
          totalTimeSpentSeconds: data.overview.totalTimeSpentSeconds || 0,
        });

        // ✅ SINKRONISASI: Petakan data riwayat terbaru ke grafik
        if (data.recentHistory && data.recentHistory.length > 0) {
          const formattedForChart = data.recentHistory.map((item: any) => ({
            game: item.gameTitle,
            score: item.score,
          }));
          setPerformanceData(formattedForChart);

          // ✅ FE-19: Simpan riwayat lengkap untuk tabel
          setRecentHistory(data.recentHistory);
        }

        // ✅ FE-19: Badge real dari backend (sudah dikalkulasi dari DB)
        if (data.badges && Array.isArray(data.badges)) {
          setBadges(data.badges);
        }
      } catch (error) {
        console.error("Gagal menarik data analytics:", error);
        toast.error("Gagal memuat data analitik terbaru.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 size={48} className="text-indigo-500 animate-spin" />
        <p className="font-black text-slate-400 uppercase tracking-widest text-sm">
          Menarik Data Performa...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10 font-sans pb-12 pt-6 animate-fade-in">
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-[2.5rem] p-8 md:p-12 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-black mb-3 text-white">
            Learning Progress 🚀
          </h1>
          <p className="text-indigo-100 font-semibold text-lg leading-relaxed max-w-2xl">
            Halo, {user?.name || "Player"}! Di sini kamu bisa melihat
            pencapaianmu, menganalisis skor, dan melihat koleksi badges yang
            sudah kamu kumpulkan.
          </p>
        </div>
      </div>

      {/* ✅ FE-19: 4 stat cards — tambah Total Waktu Belajar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50 flex items-center gap-5 hover:-translate-y-1 transition-all duration-300 group">
          <div className="w-16 h-16 shrink-0 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            🎮
          </div>
          <div>
            <p className="text-slate-500 font-bold text-sm mb-1 uppercase tracking-widest text-[10px]">
              Games Completed
            </p>
            <h2 className="text-3xl font-black text-slate-800">
              {stats.gamesCompleted}
            </h2>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50 flex items-center gap-5 hover:-translate-y-1 transition-all duration-300 group">
          <div className="w-16 h-16 shrink-0 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
            🎯
          </div>
          <div>
            <p className="text-slate-500 font-bold text-sm mb-1 uppercase tracking-widest text-[10px]">
              Overall Accuracy
            </p>
            <h2 className="text-3xl font-black text-slate-800">
              {stats.overallAccuracy}%
            </h2>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50 flex items-center gap-5 hover:-translate-y-1 transition-all duration-300 group">
          <div className="w-16 h-16 shrink-0 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center text-3xl group-hover:bg-green-600 group-hover:text-white transition-colors">
            🌟
          </div>
          <div>
            <p className="text-slate-500 font-bold text-sm mb-1 uppercase tracking-widest text-[10px]">
              XP Earned
            </p>
            <h2 className="text-3xl font-black text-slate-800">
              {stats.totalXp.toLocaleString()}
            </h2>
          </div>
        </div>

        {/* ✅ FE-19: Kartu Total Waktu Belajar — data dari totalTimeSpentSeconds backend */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50 flex items-center gap-5 hover:-translate-y-1 transition-all duration-300 group">
          <div className="w-16 h-16 shrink-0 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <Clock size={28} />
          </div>
          <div>
            <p className="text-slate-500 font-bold text-sm mb-1 uppercase tracking-widest text-[10px]">
              Waktu Belajar
            </p>
            <h2 className="text-2xl font-black text-slate-800">
              {formatStudyTime(stats.totalTimeSpentSeconds)}
            </h2>
          </div>
        </div>
      </div>

      {/* CHART */}
      <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-50">
        <div className="mb-8 px-2">
          <h2 className="text-2xl font-black text-slate-800 italic underline decoration-indigo-200 underline-offset-8">
            Statistik Performa Saya
          </h2>
        </div>

        <div className="bg-slate-50/50 rounded-[2rem] p-4 md:p-8 border border-slate-100">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-white text-indigo-600 rounded-2xl flex items-center justify-center text-3xl shadow-sm">
              📈
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">
                Score Analytics
              </h3>
              <p className="text-sm font-bold text-slate-500">
                Nilai dari sesi permainan terbaru
              </p>
            </div>
          </div>

          {performanceData.length > 0 ? (
            <div className="h-72">
              <ScoreChart data={performanceData} />
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl">
              <p className="text-slate-400 font-bold">
                Belum ada data permainan. Yuk, mainkan kuis sekarang!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ✅ FE-19: Riwayat Kuis Terakhir — tabel real dari backend */}
      {recentHistory.length > 0 && (
        <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-50">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
              <BookOpen size={26} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                Riwayat Kuis Terakhir
              </h2>
              <p className="text-sm font-bold text-slate-500">
                5 sesi permainan terakhir yang diselesaikan
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-[1.5rem] border border-slate-100">
            <table className="w-full text-left min-w-[600px]">
              <thead className="bg-slate-50">
                <tr className="text-slate-400 font-black uppercase text-[10px] tracking-widest">
                  <th className="py-4 px-6">Judul Kuis</th>
                  <th className="py-4 px-4">Tipe</th>
                  <th className="py-4 px-4">Level</th>
                  <th className="py-4 px-4 text-center">Skor</th>
                  <th className="py-4 px-4 text-center">Akurasi</th>
                  <th className="py-4 px-6 text-right">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentHistory.map((item, i) => (
                  <tr
                    key={item.sessionId || i}
                    className="hover:bg-slate-50/50 transition-all"
                  >
                    <td className="py-4 px-6">
                      <span className="font-black text-slate-700 text-sm">
                        {item.gameTitle}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-2.5 py-1 rounded-lg border border-indigo-100">
                        {templateLabel[item.templateType] || item.templateType}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`text-[10px] font-black px-2.5 py-1 rounded-lg border ${
                          item.difficulty === "HARD"
                            ? "bg-rose-50 text-rose-600 border-rose-100"
                            : item.difficulty === "MEDIUM"
                              ? "bg-amber-50 text-amber-600 border-amber-100"
                              : "bg-emerald-50 text-emerald-600 border-emerald-100"
                        }`}
                      >
                        {item.difficulty || "-"}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`font-black text-lg ${
                          item.score >= 80
                            ? "text-emerald-500"
                            : item.score >= 60
                              ? "text-amber-500"
                              : "text-rose-500"
                        }`}
                      >
                        {item.score}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="font-bold text-slate-500 text-sm">
                        {item.accuracy}%
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="text-[11px] font-bold text-slate-400">
                        {item.finishedAt
                          ? new Date(item.finishedAt).toLocaleDateString(
                              "id-ID",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "-"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ✅ FE-19: Koleksi Badges — real dari backend, tidak lagi hardcoded */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 mb-8 px-4">
          Koleksi Badges 🎖️
        </h2>

        {badges.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 px-2">
            {badges.map((badge, i) => (
              <div
                key={i}
                className={`bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center text-center transition-all duration-300 group ${badge.isUnlocked ? "hover:scale-105" : "opacity-60 grayscale"}`}
              >
                <div
                  className={`w-20 h-20 ${badge.color} rounded-full flex items-center justify-center text-4xl mb-4 shadow-inner ${badge.isUnlocked ? "group-hover:rotate-12 transition-transform" : ""}`}
                >
                  {badge.icon}
                </div>
                <span className="font-black text-slate-700 text-sm tracking-tight">
                  {badge.name}
                </span>
                <span
                  className={`text-[10px] font-bold mt-1 uppercase tracking-widest ${badge.isUnlocked ? "text-emerald-500" : "text-slate-400"}`}
                >
                  {badge.isUnlocked ? "Unlocked" : "Locked"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 py-12 rounded-[2rem] border-2 border-dashed border-slate-200 text-center">
            <span className="text-4xl grayscale opacity-50 mb-3 block">🏅</span>
            <p className="text-slate-400 font-bold">
              Kamu belum mengumpulkan badge. Kumpulkan XP untuk membukanya!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
