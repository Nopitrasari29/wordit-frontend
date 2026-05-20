import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  Legend,
} from "recharts";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import api from "../../services/api";

/**
 * Komponen ini menerima data analytics dari backend yang mencakup
 * distribusi kelas dan statistik template kuis.
 * Bisa dipakai standalone (route /teacher/analytics?group=3A)
 * atau di-embed di TeacherDashboard (prop games).
 */
export default function AnalyticsClassPage({
  data,
  games,
}: {
  data?: any;
  games?: any[];
}) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const groupFilter = searchParams.get("group"); // ✅ FIX: baca query param group

  const [analyticsData, setAnalyticsData] = useState<any>(data || null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState<string>("");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
  const [gradeFilter, setGradeFilter] = useState<string>("ALL");

  // Reset gradeFilter ketika levelFilter berubah
  useEffect(() => {
    setGradeFilter("ALL");
  }, [levelFilter]);

  // Update default selected game jika games prop atau filter berubah
  useEffect(() => {
    if (games && games.length > 0) {
      const filtered = games.filter((g) => {
        if (levelFilter !== "ALL" && g.educationLevel !== levelFilter) return false;
        if (gradeFilter !== "ALL") {
          const gGrade = String(g.classGrade || "").toLowerCase();
          const selGrade = String(gradeFilter).toLowerCase();
          if (!gGrade.includes(selGrade) && !selGrade.includes(gGrade)) return false;
        }
        return true;
      });
      if (filtered.length > 0) {
        setSelectedGameId(filtered[0].id);
      } else {
        setSelectedGameId("");
      }
    }
  }, [games, levelFilter, gradeFilter]);

  // Jika standalone (tidak ada prop data), fetch dari API berdasarkan game yang dipilih guru
  useEffect(() => {
    if (data) {
      setAnalyticsData(data);
      return;
    }
    if (games && games.length > 0 && selectedGameId) {
      // Jika ada prop games (dari TeacherDashboard), ambil analytics game yang dipilih
      const fetchFromGames = async () => {
        setIsLoading(true);
        try {
          const res = await api.get(`/analytics/game/${selectedGameId}`);
          if (res.data.status === "success") {
            setAnalyticsData(res.data.data);
          } else {
             // Reset jika gagal
             setAnalyticsData(null);
          }
        } catch (e) {
          console.error("Gagal memuat analytics:", e);
          setAnalyticsData(null);
        } finally {
          setIsLoading(false);
        }
      };
      fetchFromGames();
      return;
    }
    // ✅ FIX: Standalone tanpa prop — fetch data kelas dari /analytics/teacher/classes
    const fetchStandalone = async () => {
      setIsLoading(true);
      try {
        const params = [];
        if (levelFilter !== "ALL") {
          params.push(`educationLevel=${levelFilter}`);
        }
        if (gradeFilter !== "ALL") {
          params.push(`classGrade=${gradeFilter}`);
        }
        const queryString = params.length > 0 ? `?${params.join("&")}` : "";
        const url = `/analytics/teacher/classes${queryString}`;
          
        const res = await api.get(url);
        if (res.data.status === "success") {
          // Konversi format classes ke format classDistribution agar chart bisa jalan
          const classes = res.data.data.classes || [];
          const filtered = groupFilter
            ? classes.filter((c: any) => c.name === groupFilter)
            : classes;

          setAnalyticsData({
            classDistribution: filtered.map((c: any) => ({
              groupName: c.name,
              averageScore: c.averageScore,
              studentCount: c.students,
            })),
            summary: {
              totalParticipants: filtered.reduce(
                (acc: number, c: any) => acc + c.students,
                0,
              ),
              averageAccuracy:
                filtered.length > 0
                  ? Math.round(
                      filtered.reduce(
                        (acc: number, c: any) => acc + (c.averageAccuracy || 0),
                        0,
                      ) / filtered.length,
                    )
                  : 0,
            },
            groupName: groupFilter,
          });
        }
      } catch (e) {
        console.error("Gagal memuat analytics kelas:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStandalone();
  }, [data, games, groupFilter, selectedGameId, levelFilter, gradeFilter]);

  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4">
        <Loader2 size={40} className="text-indigo-500 animate-spin" />
        <p className="font-black text-slate-400 text-sm uppercase tracking-widest">
          Memuat Analitik...
        </p>
      </div>
    );
  }

  // 🛠️ SINKRONISASI DATA: Ambil distribusi kelas dari hasil Backend (BE-16)
  // Backend mengirimkan: classDistribution: [{ groupName: "3A", averageScore: 85, studentCount: 10 }]
  const classData = analyticsData?.classDistribution || [];

  // Ambil data summary untuk info tambahan
  const summary = analyticsData?.summary || {
    totalParticipants: 0,
    averageAccuracy: 0,
  };

  // Warna-warna ceria untuk Bar Chart agar sesuai dengan tema WordIT
  const COLORS = ["#4f46e5", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

  return (
    <div className="space-y-8 font-sans">
      {/* ✅ FIX: Tombol Kembali hanya muncul jika standalone (ada groupFilter atau tidak ada prop data/games) */}
      {groupFilter && (
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-black text-sm transition-colors"
          >
            <ArrowLeft size={18} /> Kembali ke Daftar Kelas
          </button>
          <h2 className="text-2xl font-black text-slate-800">
            Detail Kelas <span className="text-indigo-600">{groupFilter}</span>
          </h2>
        </div>
      )}

      {/* ✅ FIX: Dropdown untuk memilih game dan Jenjang jika berada di Teacher Dashboard */}
      {games && games.length > 0 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 p-4 md:p-6 rounded-[2rem] border border-slate-100 mb-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-xl">
               🕹️
             </div>
             <div>
               <h3 className="font-black text-slate-700 text-sm">Pilih Data Analitik</h3>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Filter berdasarkan Game atau Jenjang</p>
             </div>
          </div>
          <div className="flex flex-col md:flex-row gap-3">
            <select 
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="bg-white border-2 border-indigo-100 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-indigo-400 min-w-[150px]"
            >
              <option value="ALL">Semua Jenjang</option>
              <option value="SD">Sekolah Dasar (SD)</option>
              <option value="SMP">SMP</option>
              <option value="SMA">SMA</option>
              <option value="UNIVERSITY">Universitas / Umum</option>
            </select>
            {["SD", "SMP", "SMA"].includes(levelFilter) && (
              <select 
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="bg-white border-2 border-indigo-100 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-indigo-400 min-w-[150px]"
              >
                <option value="ALL">Semua Kelas</option>
                {levelFilter === "SD" && [1, 2, 3, 4, 5, 6].map(grade => (
                  <option key={grade} value={String(grade)}>Kelas {grade}</option>
                ))}
                {levelFilter === "SMP" && [7, 8, 9].map(grade => (
                  <option key={grade} value={String(grade)}>Kelas {grade}</option>
                ))}
                {levelFilter === "SMA" && [10, 11, 12].map(grade => (
                  <option key={grade} value={String(grade)}>Kelas {grade}</option>
                ))}
              </select>
            )}
            <select 
              value={selectedGameId}
              onChange={(e) => setSelectedGameId(e.target.value)}
              className="bg-white border-2 border-indigo-100 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-indigo-400 min-w-[200px]"
            >
              <option value="">-- Pilih Game Tertentu --</option>
              {games
                .filter((g) => {
                  if (levelFilter !== "ALL" && g.educationLevel !== levelFilter) return false;
                  if (gradeFilter !== "ALL") {
                    const gGrade = String(g.classGrade || "").toLowerCase();
                    const selGrade = String(gradeFilter).toLowerCase();
                    if (!gGrade.includes(selGrade) && !selGrade.includes(gGrade)) return false;
                  }
                  return true;
                })
                .map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
            </select>
          </div>
        </div>
      )}

      {/* ================= SUMMARY CARDS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-indigo-600 p-6 rounded-[2rem] text-white shadow-lg shadow-indigo-100 flex items-center justify-between">
          <div>
            <p className="text-indigo-100 font-bold text-xs uppercase tracking-widest mb-1">
              Total Peserta
            </p>
            <h2 className="text-4xl font-black">{summary.totalParticipants}</h2>
          </div>
          <div className="text-4xl opacity-50">👥</div>
        </div>
        <div className="bg-emerald-500 p-6 rounded-[2rem] text-white shadow-lg shadow-emerald-100 flex items-center justify-between">
          <div>
            <p className="text-emerald-50 font-bold text-xs uppercase tracking-widest mb-1">
              Rata-Rata Akurasi
            </p>
            <h2 className="text-4xl font-black">{summary.averageAccuracy}%</h2>
          </div>
          <div className="text-4xl opacity-50">🎯</div>
        </div>
      </div>

      {/* ================= SCORE DISTRIBUTION CHART ================= */}
      <div className="bg-white p-6 md:p-10 rounded-[3rem] shadow-sm border border-slate-100">
        {/* Header Analitik */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl">
              📈
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                Performa Kelompok
              </h2>
              <p className="text-sm font-bold text-slate-500">
                Rata-rata nilai berdasarkan awalan nama (Auto-Grouping)
              </p>
            </div>
          </div>

          <div className="bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Total Kelompok: {classData.length}
            </span>
          </div>
        </div>

        {/* Chart Container */}
        <div className="h-80 w-full">
          {classData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={classData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />

                <XAxis
                  dataKey="groupName"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontWeight: 800, fontSize: 12 }}
                  dy={10}
                />

                <YAxis
                  domain={[0, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontWeight: 800, fontSize: 12 }}
                />

                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "1.5rem",
                    border: "none",
                    boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                    fontWeight: "bold",
                    padding: "1rem",
                  }}
                  itemStyle={{ color: "#4f46e5" }}
                />

                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{
                    paddingBottom: "20px",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                />

                <Bar
                  name="Rata-Rata Skor"
                  dataKey="averageScore"
                  radius={[12, 12, 0, 0]}
                  barSize={50}
                >
                  {classData.map((_entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50">
              <span className="text-4xl mb-3">🔍</span>
              <p className="text-slate-400 font-bold">
                Belum ada data kelompok terdeteksi.
              </p>
              <p className="text-[10px] text-slate-300 uppercase tracking-widest mt-1">
                Gunakan format "NamaKelas_NamaSiswa" pada nama pemain
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ================= TOP 5 DIFFICULT QUESTIONS ================= */}
      {analyticsData?.difficultQuestions?.length > 0 && (
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-6 flex items-center gap-2">
            <span className="text-rose-500">⚠️</span> Soal Paling Sulit (Top 5)
          </h3>
          <div className="space-y-3">
            {analyticsData.difficultQuestions.map((q: any, i: number) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-rose-50 rounded-2xl border border-rose-100"
              >
                <span className="font-bold text-slate-700">
                  Pertanyaan #{q.questionIndex + 1}
                </span>
                <span className="bg-rose-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">
                  {q.mistakeCount} Siswa Salah
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
