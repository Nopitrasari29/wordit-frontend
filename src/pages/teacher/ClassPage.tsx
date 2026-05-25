import { useState, useEffect } from "react";
import {
  Users,
  AlertTriangle,
  TrendingUp,
  ChevronRight,
  Loader2,
  Download,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function ClassPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  // State untuk daftar kelas (auto-grouped berdasarkan prefix nama pemain)
  const [classes, setClasses] = useState<
    {
      id: string;
      name: string;
      students: number;
      averageScore: number;
      averageAccuracy: number;
      totalPlays: number;
      icon: string;
    }[]
  >([]);

  // State untuk siswa yang butuh remedial/perhatian (Performa Rendah)
  const [atRiskStudents, setAtRiskStudents] = useState<
    {
      id: string;
      name: string;
      className: string;
      gameName: string;
      score: number;
      issue: string;
    }[]
  >([]);

  useEffect(() => {
    const fetchClassAnalytics = async () => {
      setIsLoading(true);
      try {
        const response = await api.get("/analytics/teacher/classes");
        if (response.data.status === "success") {
          setClasses(response.data.data.classes);
          setAtRiskStudents(response.data.data.atRiskStudents);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Gagal mengambil data analytics kelas:", error);
        toast.error("Gagal memuat data kelas.");
        setIsLoading(false);
      }
    };

    fetchClassAnalytics();
  }, []);

  const handleResetForRemedial = async (resultId: string, studentName: string) => {
    if (!window.confirm(`Reset hasil kuis ${studentName} agar bisa melakukan tes ulang / remedial? Data nilai sebelumnya akan dihapus secara permanen.`)) {
      return;
    }
    
    try {
      const response = await api.delete(`/analytics/remedial/${resultId}`);
      if (response.data.status === "success") {
        toast.success(`Berhasil! Sesi ${studentName} direset untuk remedial.`);
        // Saring siswa dari state
        setAtRiskStudents((prev) => prev.filter((s) => s.id !== resultId));
        
        // Refresh data kelas untuk memperbarui rata-rata skor
        const classesResponse = await api.get("/analytics/teacher/classes");
        if (classesResponse.data.status === "success") {
          setClasses(classesResponse.data.data.classes);
        }
      }
    } catch (err: any) {
      console.error("Gagal reset remedial:", err);
      toast.error(err.response?.data?.message || "Gagal melakukan reset remedial.");
    }
  };

  const handleExportCSV = () => {
    if (classes.length === 0) {
      return toast.error("Tidak ada data kelas untuk diekspor.");
    }
    let csvContent = "Nama Kelas,Jumlah Siswa,Rata-rata Skor,Rata-rata Akurasi (%),Total Sesi Main\n";
    classes.forEach((c) => {
      csvContent += `"${c.name}",${c.students},${c.averageScore},${c.averageAccuracy},${c.totalPlays}\n`;
    });
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_Performa_Kelas_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Laporan kelas berhasil diunduh! 📄");
  };

  const handleExportAtRiskCSV = () => {
    if (atRiskStudents.length === 0) {
      return toast.error("Tidak ada siswa remedial untuk diekspor.");
    }
    let csvContent = "Nama Siswa,Kelas,Kuis,Detail Kendala,Skor\n";
    atRiskStudents.forEach((s) => {
      csvContent += `"${s.name}","${s.className}","${s.gameName}","${s.issue}",${s.score}\n`;
    });
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Daftar_Remedial_Siswa_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Daftar remedial berhasil diunduh! 📄");
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 size={48} className="text-indigo-500 animate-spin" />
        <p className="font-black text-slate-400 uppercase tracking-widest text-sm">
          Menghitung Data Kelas...
        </p>
      </div>
    );
  }

  // Data untuk Recharts
  const chartData = classes.map((c) => ({
    name: c.name,
    RataRataSkor: c.averageScore,
  }));

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 md:px-6 font-sans space-y-10 animate-fade-in">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            Manajemen Kelas{" "}
            <Users className="text-indigo-500" size={36} strokeWidth={3} />
          </h1>
          {/* ✅ FE-20: Penjelasan auto-grouping untuk guru */}
          <p className="text-slate-500 font-bold mt-2">
            Kelompok dibentuk otomatis dari nama pemain. Format:{" "}
            <span className="font-black text-indigo-600">
              NamaKelas_NamaSiswa
            </span>{" "}
            (contoh: <span className="text-indigo-400">3A_Budi</span> → Kelas{" "}
            <span className="text-indigo-400">3A</span>).
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {classes.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-6 py-4 rounded-full font-black shadow-xl shadow-indigo-100 transition-all active:scale-95 flex items-center gap-2"
            >
              <Download size={18} /> Ekspor Kelas (CSV)
            </button>
          )}
          <button
            onClick={() => navigate("/teacher/create/level")}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-full font-black shadow-xl shadow-indigo-200 transition-all active:scale-95 flex items-center gap-2"
          >
            + Buat Kuis Baru
          </button>
        </div>
      </div>

      {classes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-slate-100">
          <p className="text-5xl mb-4">📭</p>
          <p className="font-black text-slate-600 text-lg">
            Belum ada data kelas.
          </p>
          <p className="text-slate-400 font-bold text-sm mt-2">
            Siswa perlu memakai format nama{" "}
            <span className="text-indigo-500 font-black">
              NamaKelas_NamaSiswa
            </span>{" "}
            saat bergabung.
          </p>
        </div>
      ) : (
        <>
          {/* DAFTAR KELAS (Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {classes.map((c) => (
              <div
                key={c.id}
                className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col group hover:-translate-y-2 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-100 transition-colors"></div>

                <div className="relative z-10">
                  <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center text-3xl mb-6 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-transform">
                    {c.icon}
                  </div>

                  <h2 className="text-2xl font-black text-slate-800 mb-1">
                    Kelas {c.name}
                  </h2>
                  <p className="text-slate-400 font-bold text-sm mb-4">
                    {c.students} Siswa Unik · {c.totalPlays} Sesi Main
                  </p>

                  <div className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Rata-rata Skor
                    </span>
                    <span
                      className={`font-black text-lg ${c.averageScore >= 75 ? "text-emerald-500" : "text-amber-500"}`}
                    >
                      {c.averageScore}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center mb-6">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Rata-rata Akurasi
                    </span>
                    <span
                      className={`font-black text-lg ${c.averageAccuracy >= 70 ? "text-emerald-500" : "text-amber-500"}`}
                    >
                      {c.averageAccuracy}%
                    </span>
                  </div>

                  {/* ✅ FIX: Navigasi bawa groupName sebagai query param */}
                  <button
                    onClick={() =>
                      navigate(
                        `/teacher/analytics?group=${encodeURIComponent(c.name)}`,
                      )
                    }
                    className="w-full bg-slate-100 hover:bg-indigo-600 hover:text-white text-indigo-600 py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 group/btn"
                  >
                    Lihat Detail{" "}
                    <ChevronRight
                      size={18}
                      className="group-hover/btn:translate-x-1 transition-transform"
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ANALYTICS SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* KIRI: Grafik Performa Kelompok */}
            <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-slate-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                  <TrendingUp size={24} strokeWidth={3} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">
                    Perbandingan Kelompok
                  </h3>
                  <p className="text-sm font-bold text-slate-400">
                    Rata-rata skor berdasarkan kelas
                  </p>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontWeight: 800, fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontWeight: 800, fontSize: 12 }}
                    />
                    <Tooltip
                      cursor={{ fill: "#f8fafc" }}
                      contentStyle={{
                        borderRadius: "1rem",
                        border: "none",
                        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                        fontWeight: "bold",
                      }}
                    />
                    <Bar
                      dataKey="RataRataSkor"
                      radius={[8, 8, 0, 0]}
                      barSize={50}
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.RataRataSkor >= 75
                              ? "#10b981"
                              : entry.RataRataSkor >= 60
                                ? "#f59e0b"
                                : "#ef4444"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* KANAN: Alert Siswa Performa Rendah */}
            <div className="bg-rose-50/50 rounded-[2.5rem] p-6 md:p-8 border-2 border-rose-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 text-9xl -mt-4 -mr-4 opacity-5 pointer-events-none">
                ⚠️
              </div>

              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="bg-rose-100 text-rose-600 p-2 rounded-xl shrink-0">
                  <AlertTriangle size={20} strokeWidth={3} />
                </div>
                <h3 className="text-lg font-black text-rose-900 tracking-tight leading-tight">
                  Perlu Perhatian Khusus
                </h3>
              </div>

              <p className="text-sm font-bold text-rose-700/70 mb-6">
                Siswa dengan nilai di bawah batas KKM yang mungkin membutuhkan
                remedial.
              </p>

              <div className="space-y-3 relative z-10">
                {atRiskStudents.length > 0 ? (
                  atRiskStudents.map((student) => (
                    <div
                      key={student.id}
                      className="bg-white p-4 rounded-2xl shadow-sm border border-rose-50 flex items-center justify-between group hover:border-rose-200 transition-colors"
                    >
                      <div>
                        <h4 className="font-black text-slate-800 text-sm">
                          {student.name}
                        </h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                          Kelas {student.className} · {student.gameName}
                        </p>
                        <p className="text-xs font-bold text-rose-500 mt-1">
                          {student.issue}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleResetForRemedial(student.id, student.name)}
                          className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-2 rounded-xl text-[10px] font-black transition-all active:scale-95"
                          title="Reset Sesi (Remedial / Test Ulang)"
                        >
                          🔄 Remed
                        </button>
                        <div className="bg-rose-50 w-12 h-12 rounded-xl flex items-center justify-center font-black text-rose-600 border border-rose-100 shrink-0">
                          {student.score}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <span className="text-4xl block mb-2 grayscale opacity-50">
                      🎉
                    </span>
                    <p className="text-slate-500 font-bold text-sm">
                      Semua siswa aman! Tidak ada yang perlu remedial saat ini.
                    </p>
                  </div>
                )}
              </div>

              {atRiskStudents.length > 0 && (
                <button
                  onClick={handleExportAtRiskCSV}
                  className="w-full mt-6 bg-rose-600 hover:bg-rose-500 text-white py-4 rounded-2xl font-black transition-all shadow-lg shadow-rose-200 active:scale-95 text-sm flex items-center justify-center gap-2"
                >
                  <Download size={18} /> Ekspor Daftar Remedial (CSV)
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
