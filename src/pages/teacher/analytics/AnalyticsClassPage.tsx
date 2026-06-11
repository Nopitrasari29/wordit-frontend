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
import { ArrowLeft, Loader2, Download } from "lucide-react";
import api from "../../services/api";
import { toast } from "react-hot-toast";

export default function AnalyticsClassPage({
  data,
  games,
}: {
  data?: any;
  games?: any[];
}) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const groupFilter = searchParams.get("group"); 

  const [analyticsData, setAnalyticsData] = useState<any>(data || null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState<string>("");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
  const [gradeFilter, setGradeFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>(""); 

  useEffect(() => {
    setGradeFilter("ALL");
  }, [levelFilter]);

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

  useEffect(() => {
    if (data) {
      setAnalyticsData(data);
      return;
    }

    const fetchStandalone = async () => {
      setIsLoading(true);
      try {
        let url = "/analytics/teacher/classes";
        if (games && games.length > 0 && selectedGameId) {
          url = `/analytics/game/${selectedGameId}`;
        } else {
          const params = [];
          if (levelFilter !== "ALL") params.push(`educationLevel=${levelFilter}`);
          if (gradeFilter !== "ALL") params.push(`classGrade=${gradeFilter}`);
          const queryString = params.length > 0 ? `?${params.join("&")}` : "";
          url = `/analytics/teacher/classes${queryString}`;
        }
          
        const res = await api.get(url);
        if (res.data.status === "success") {
          const source = res.data.data;
          const classes = source.classes || [];
          const rawStudents = source.allStudentsData || [];
          const rawDifficultQuestions = source.difficultQuestions || [];

          const filteredClasses = groupFilter
            ? classes.filter((c: any) => c.name === groupFilter)
            : classes;

          // 🛠️ FIX REVISI 2 & 3: Saring list siswa secara kondisional agar tidak kosong di dashboard utama
          const filteredStudents = groupFilter
            ? rawStudents.filter((s: any) => s.className === groupFilter)
            : rawStudents;

          const filteredQuestions = groupFilter
            ? rawDifficultQuestions.filter((q: any) => q.className === groupFilter || !q.className)
            : rawDifficultQuestions;

          setAnalyticsData({
            classDistribution: filteredClasses.map((c: any) => ({
              groupName: c.name,
              averageScore: c.averageScore,
              studentCount: c.students,
            })),
            summary: source.summary || {
              totalParticipants: filteredClasses.reduce((acc: number, c: any) => acc + c.students, 0),
              averageAccuracy: filteredClasses.length > 0 ? Math.round(filteredClasses.reduce((acc: number, c: any) => acc + (c.averageAccuracy || 0), 0) / filteredClasses.length) : 0,
            },
            groupName: groupFilter,
            allStudentsData: filteredStudents,
            difficultQuestions: filteredQuestions
          });
        }
      } catch (e) {
        console.error("Gagal memuat analytics kelas:", e);
      } {
        setIsLoading(false);
      }
    };
    fetchStandalone();
  }, [data, games, groupFilter, selectedGameId, levelFilter, gradeFilter]);

  const handleExportIndividualCSV = () => {
    const students = analyticsData?.allStudentsData || [];
    if (students.length === 0) return toast.error("Tidak ada data siswa.");
    let csvContent = "Nama Join Siswa,Kelompok/Kelas,Nama Game,Skor Akhir,Akurasi (%),Durasi Bermain\n";
    students.forEach((s: any) => {
      const min = Math.floor((s.timeSpent || 0) / 60);
      const sec = (s.timeSpent || 0) % 60;
      csvContent += `"${s.name}","${s.className}","${s.gameName}",${s.score},${s.accuracy}%,${min}m ${sec}s\n`;
    });
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_Nilai_Siswa_${groupFilter || "Semua"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4">
        <Loader2 size={40} className="text-indigo-500 animate-spin" />
        <p className="font-black text-slate-400 text-sm uppercase tracking-widest">Memuat Analitik...</p>
      </div>
    );
  }

  const classData = analyticsData?.classDistribution || [];
  const summary = analyticsData?.summary || { totalParticipants: 0, averageAccuracy: 0 };
  const COLORS = ["#4f46e5", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];
  const filteredStudents = (analyticsData?.allStudentsData || []).filter((student: any) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 font-sans">
      {groupFilter && (
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-black text-sm transition-colors">
            <ArrowLeft size={18} /> Kembali ke Daftar Kelas
          </button>
          <h2 className="text-2xl font-black text-slate-800">
            Detail Kelas <span className="text-indigo-600">{groupFilter}</span>
          </h2>
        </div>
      )}

      {games && games.length > 0 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 p-4 md:p-6 rounded-[2rem] border border-slate-100 mb-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-xl">🕹️</div>
             <div>
               <h3 className="font-black text-slate-700 text-sm">Pilih Data Analitik</h3>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Filter berdasarkan Game atau Jenjang</p>
             </div>
          </div>
          <div className="flex flex-col md:flex-row gap-3">
            <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} className="bg-white border-2 border-indigo-100 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-indigo-400 min-w-[150px]">
              <option value="ALL">Semua Jenjang</option>
              <option value="SD">Sekolah Dasar (SD)</option>
              <option value="SMP">SMP</option>
              <option value="SMA">SMA</option>
              <option value="UNIVERSITY">Universitas / Umum</option>
            </select>
            <select value={selectedGameId} onChange={(e) => setSelectedGameId(e.target.value)} className="bg-white border-2 border-indigo-100 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-indigo-400 min-w-[200px]">
              <option value="">-- Pilih Game --</option>
              {games.filter(g => (levelFilter === "ALL" || g.educationLevel === levelFilter)).map(g => (
                <option key={g.id} value={g.id}>{g.title}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-indigo-600 p-6 rounded-[2rem] text-white shadow-lg flex items-center justify-between">
          <div>
            <p className="text-indigo-100 font-bold text-xs uppercase tracking-widest mb-1">Total Peserta</p>
            <h2 className="text-4xl font-black">{summary.totalParticipants}</h2>
          </div>
          <div className="text-4xl opacity-50">👥</div>
        </div>
        <div className="bg-emerald-500 p-6 rounded-[2rem] text-white shadow-lg flex items-center justify-between">
          <div>
            <p className="text-emerald-50 font-bold text-xs uppercase tracking-widest mb-1">Rata-Rata Akurasi</p>
            <h2 className="text-4xl font-black">{summary.averageAccuracy}%</h2>
          </div>
          <div className="text-4xl opacity-50">🎯</div>
        </div>
      </div>

      {/* CHART KELOMPOK */}
      <div className="bg-white p-6 md:p-10 rounded-[3rem] shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl">📈</div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Performa Kelompok</h2>
              <p className="text-sm font-bold text-slate-500">Rata-rata nilai berdasarkan awalan nama (Auto-Grouping)</p>
            </div>
          </div>
        </div>
        <div className="h-80 w-full">
          {classData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="groupName" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontWeight: 800 }} dy={10} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontWeight: 800 }} />
                <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={{ borderRadius: "1.5rem", border: "none", fontWeight: "bold" }} />
                <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: "20px", fontSize: "12px", fontWeight: "bold" }} />
                <Bar name="Rata-Rata Skor" dataKey="averageScore" radius={[12, 12, 0, 0]} barSize={50}>
                  {classData.map((_entry: any, index: number) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50">
              <p className="text-slate-400 font-bold">Belum ada data kelompok terdeteksi.</p>
            </div>
          )}
        </div>
      </div>

      {/* TABEL INTERAKTIF NILAI INDIVIDU */}
      <div className="bg-white p-6 md:p-10 rounded-[3rem] shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl">📋</div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Nilai Individu Siswa</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">Berdasarkan Nama Sesi Join Room</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <input
              type="text"
              placeholder="🔍 Cari nama siswa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-50 border-4 border-slate-100 focus:border-indigo-500 rounded-2xl px-4 py-2 font-bold text-slate-700 text-sm outline-none w-full sm:w-60 transition-all"
            />
            <button onClick={handleExportIndividualCSV} className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 transition-all">
              <Download size={14} /> Ekspor CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-black text-xs uppercase tracking-widest bg-slate-50">
                <th className="p-4 rounded-l-2xl">Nama Join Siswa</th>
                <th className="p-4 text-center">Kelompok/Kelas</th>
                <th className="p-4 text-center">Akurasi</th>
                <th className="p-4 text-center">Durasi Bermain</th>
                <th className="p-4 text-center rounded-r-2xl">Skor Akhir</th>
              </tr>
            </thead>
            <tbody className="text-sm font-bold text-slate-600 divide-y divide-slate-50">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student: any) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 text-slate-800 font-black">{student.name}</td>
                    <td className="p-4 text-center">
                      <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs">
                        {student.className}
                      </span>
                    </td>
                    <td className="p-4 text-center text-emerald-500">{student.accuracy}%</td>
                    <td className="p-4 text-center text-slate-500 font-semibold">
                      {student.timeSpent ? `${Math.floor(student.timeSpent / 60)}m ${student.timeSpent % 60}s` : "-"}
                    </td>
                    <td className="p-4 text-center text-indigo-600 font-black text-base">{student.score} XP</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">Tidak ada riwayat pengerjaan nilai yang cocok.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION SOAL PALING SULIT */}
      {analyticsData?.difficultQuestions && analyticsData.difficultQuestions.length > 0 && (
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-6 flex items-center gap-2">
            <span className="text-rose-500">⚠️</span> Soal Paling Sulit (Top 5)
          </h3>
          <div className="space-y-3">
            {analyticsData.difficultQuestions.map((q: any, i: number) => (
              <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-rose-50 rounded-2xl border border-rose-100 gap-2">
                <div className="flex flex-col">
                  <span className="font-bold text-slate-400 text-xs uppercase tracking-wider">Soal #{q.questionIndex + 1}</span>
                  <p className="font-black text-slate-700 text-sm mt-0.5">{q.questionText}</p>
                </div>
                <span className="bg-rose-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider shrink-0 text-center">
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