import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { generateGameWithAI } from "../../pages/services/ai.service";

interface AIProps {
  level: string;
  template: string;
  onFinish: (data: any) => void;
  requestedCount?: number;
  onCountChange?: (count: number) => void;
}

export default function AIQuizGenerator({
  level,
  template,
  onFinish,
  requestedCount = 5,
  onCountChange,
}: AIProps) {
  const cacheKey = `ai_gen_${level}_${template}`;

  const [topic, setTopic] = useState(() => {
    return sessionStorage.getItem(`${cacheKey}_topic`) || "";
  });
  const [loading, setLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [itemsList, setItemsList] = useState<any[]>(() => {
    const saved = sessionStorage.getItem(`${cacheKey}_items`);
    return saved ? JSON.parse(saved) : [];
  });
  const [countWarning, setCountWarning] = useState<string | null>(() => {
    return sessionStorage.getItem(`${cacheKey}_warning`) || null;
  });

  // Keep sessionStorage updated
  useEffect(() => {
    sessionStorage.setItem(`${cacheKey}_topic`, topic);
  }, [topic, cacheKey]);

  useEffect(() => {
    if (itemsList && itemsList.length > 0) {
      sessionStorage.setItem(`${cacheKey}_items`, JSON.stringify(itemsList));
    } else {
      sessionStorage.removeItem(`${cacheKey}_items`);
    }
  }, [itemsList, cacheKey]);

  useEffect(() => {
    if (countWarning) {
      sessionStorage.setItem(`${cacheKey}_warning`, countWarning);
    } else {
      sessionStorage.removeItem(`${cacheKey}_warning`);
    }
  }, [countWarning, cacheKey]);

  // 🛠️ UNIVERSAL DATA ADAPTER (Mendukung semua 10 template)
  const getNormalizedItems = (data: any) => {
    if (!data) return [];
    const raw = data.data || data;
    let items: any[] = [];

    if (raw.cards) items = raw.cards;
    else if (raw.words) items = raw.words;
    else if (raw.questions) items = raw.questions;
    else if (raw.pairs)
      items = raw.pairs; // Untuk MATCHING
    else if (typeof raw === "object" && !Array.isArray(raw)) {
      items = Object.keys(raw)
        .filter((k) => k.startsWith("soal") || !isNaN(Number(k)))
        .map((k) => raw[k]);
    } else if (Array.isArray(raw)) {
      items = raw;
    }

    return items;
  };

  async function generate() {
    if (topic.length < 3) return toast.error("Topik minimal 3 huruf ya!");
    setLoading(true);
    setCountWarning(null);
    try {
      const response = await generateGameWithAI({
        topic,
        educationLevel: level as any,
        templateType: template as any,
        count: requestedCount,
      });
      const items = getNormalizedItems(response);
      setItemsList(items);

      // ✅ FE-17: Validasi strict count — tampilkan peringatan jika soal kurang
      if (items.length < requestedCount) {
        setCountWarning(
          `AI hanya menghasilkan ${items.length} soal dari ${requestedCount} yang diminta. Kamu tetap bisa menambahkan soal secara bertahap atau menggunakan soal ini.`,
        );
        toast(`⚠️ AI menghasilkan ${items.length}/${requestedCount} soal`, {
          icon: "⚠️",
        });
      } else {
        toast.success(`Magic Berhasil! ${items.length} soal ${template} siap.`);
      }
    } catch (err: any) {
      toast.error("Gagal generate soal AI. Cek koneksi.");
    } finally {
      setLoading(false);
    }
  }

  async function generateMore() {
    const missingCount = requestedCount - itemsList.length;
    if (missingCount <= 0) return;

    setLoading(true);
    try {
      const response = await generateGameWithAI({
        topic,
        educationLevel: level as any,
        templateType: template as any,
        count: missingCount,
      });
      const newItems = getNormalizedItems(response);
      if (newItems.length === 0) {
        toast.error("AI tidak berhasil menghasilkan soal tambahan. Coba lagi.");
        return;
      }
      const updatedList = [...itemsList, ...newItems];
      setItemsList(updatedList);

      if (updatedList.length < requestedCount) {
        setCountWarning(
          `AI berhasil menambahkan ${newItems.length} soal (total ${updatedList.length}/${requestedCount}). Klik tombol di bawah untuk menambah lagi.`,
        );
      } else {
        setCountWarning(null);
        toast.success(`Berhasil menambahkan ${newItems.length} soal baru! Total ${updatedList.length} soal siap.`);
      }
    } catch (err: any) {
      toast.error("Gagal generate soal tambahan AI.");
    } finally {
      setLoading(false);
    }
  }

  const previewItems = itemsList;

  return (
    <div className="bg-slate-900/90 backdrop-blur-2xl p-8 md:p-12 rounded-[3rem] text-white shadow-2xl relative overflow-hidden border border-indigo-500/30 shadow-[0_0_50px_rgba(99,102,241,0.15)] font-sans">
      <div className="relative z-10">
        <div className="mb-6">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h2 className="text-3xl font-black mb-2 italic flex items-center gap-3">
                Magic Generator <span className="text-indigo-400">✨</span>
              </h2>
              <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">
                Merancang kuis {template.replace(/_/g, " ")} • Level {level} •{" "}
                {requestedCount} Soal
              </p>
            </div>
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/20 px-4 py-2 rounded-full font-black text-xs transition-all active:scale-95 flex items-center gap-1.5"
            >
              💡 {showGuide ? "Tutup Panduan" : "Panduan Magic"}
            </button>
          </div>
        </div>

        {showGuide && (
          <div className="mb-8 bg-slate-800/80 border border-slate-700/60 p-6 rounded-2xl space-y-4 animate-in slide-in-from-top-4 duration-300">
            <h4 className="font-black text-indigo-400 text-sm uppercase tracking-wider flex items-center gap-2">
              💡 Cara Menggunakan Magic Generator
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300 font-medium">
              <div className="space-y-3">
                <p>
                  <strong className="text-white">1. Pilih Topik yang Jelas:</strong><br />
                  Gunakan istilah spesifik. Contoh: <code className="bg-slate-900 text-indigo-300 px-1.5 py-0.5 rounded">Tata Surya & Planet</code> atau <code className="bg-slate-900 text-indigo-300 px-1.5 py-0.5 rounded">Persamaan Kuadrat</code> lebih baik daripada <code className="bg-slate-900 text-indigo-300 px-1.5 py-0.5 rounded">Sains</code> atau <code className="bg-slate-900 text-indigo-300 px-1.5 py-0.5 rounded">Matematika</code>.
                </p>
                <p>
                  <strong className="text-white">2. Adaptasi Templat & Level:</strong><br />
                  AI secara otomatis menyesuaikan kosakata dan kerumitan soal untuk level <strong className="text-indigo-400">{level}</strong> dan format game <strong className="text-indigo-400">{template.replace(/_/g, " ")}</strong>.
                </p>
              </div>
              <div className="space-y-3">
                <p>
                  <strong className="text-white">3. Skema Bertahap (Incremental):</strong><br />
                  Jika kuota hasil generate pertama kurang dari target {requestedCount} soal, gunakan tombol <code className="bg-slate-900 text-indigo-300 px-1.5 py-0.5 rounded">➕ Tambah Soal</code> untuk menambah soal baru tanpa menghapus soal yang sudah terbuat.
                </p>
                <p>
                  <strong className="text-white">4. Review & Impor:</strong><br />
                  Semua soal pratinjau di bawah dapat diedit atau dihapus secara individual sebelum Anda mengeklik <strong className="text-indigo-400">Gunakan Soal AI</strong> untuk menyalinnya ke Lembar Kerja Builder.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 🎯 FE-NEW-05: DISCLAIMER AI BANNER */}
        <div className="mb-8 bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-start gap-4">
          <span className="text-xl">⚠️</span>
          <p className="text-[11px] md:text-xs text-amber-200/80 font-medium leading-relaxed">
            <span className="font-black text-amber-400 uppercase mr-1">
              Peringatan:
            </span>
            Hasil AI tidak selalu 100% akurat. Mohon untuk melakukan{" "}
            <span className="text-white underline italic">
              verifikasi manual
            </span>{" "}
            pada pertanyaan dan jawaban di bawah sebelum dipublikasikan untuk
            menjaga kualitas materi.
          </p>
        </div>

        <div className="flex flex-col gap-4 mb-10">
          <textarea
            placeholder="Ketik topik atau prompt kuis (Misal: Ekosistem Laut, rantai makanan, dan terumbu karang)..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            rows={3}
            className="w-full bg-slate-800/40 backdrop-blur-md border border-slate-700/50 focus:border-indigo-500 rounded-2xl p-5 outline-none transition-all font-bold text-base text-white resize-none"
          />
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
            <div className="flex items-center gap-3 bg-slate-800/60 border border-slate-700/40 px-5 py-3 rounded-2xl w-full sm:w-auto">
              <label className="text-xs font-black text-slate-300 uppercase tracking-wider whitespace-nowrap">
                Jumlah Soal
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={requestedCount}
                onChange={(e) =>
                  onCountChange?.(
                    Math.max(1, Math.min(20, Number(e.target.value)))
                  )
                }
                className="w-16 bg-slate-950 border-2 border-slate-700/60 rounded-xl px-2 py-1.5 text-center font-black text-base text-white outline-none focus:border-indigo-500 transition-all"
              />
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                soal (maks. 20)
              </span>
            </div>
            
            <button
              onClick={generate}
              disabled={loading}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black px-10 py-4 rounded-2xl transition-all active:scale-95 whitespace-nowrap shadow-lg shadow-indigo-500/20 border border-indigo-400/30 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  AI Lagi Mikir...
                </span>
              ) : (
                <span>Generate Magic 🪄</span>
              )}
            </button>
          </div>
        </div>

        {/* ✅ FE-17: Banner peringatan jika soal kurang dari yang diminta */}
        {countWarning && (
          <div className="mb-6 bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-start gap-4">
            <span className="text-xl shrink-0">⚠️</span>
            <div className="flex-1">
              <p className="text-[12px] text-rose-200/90 font-bold leading-relaxed">
                {countWarning}
              </p>
              <div className="flex gap-3 mt-3">
                <button
                  onClick={generateMore}
                  disabled={loading}
                  className="text-[11px] font-black text-emerald-300 hover:text-white bg-emerald-500/20 hover:bg-emerald-500/40 px-4 py-2 rounded-full transition-all border border-emerald-500/30 disabled:opacity-50"
                >
                  {loading ? "Generating..." : `➕ Tambah ${requestedCount - itemsList.length} Soal`}
                </button>
                <button
                  onClick={generate}
                  disabled={loading}
                  className="text-[11px] font-black text-rose-300 hover:text-white bg-rose-500/20 hover:bg-rose-500/40 px-4 py-2 rounded-full transition-all border border-rose-500/30 disabled:opacity-50"
                >
                  {loading ? "Generating..." : "🔄 Generate Ulang Semua"}
                </button>
              </div>
            </div>
          </div>
        )}

        {previewItems.length > 0 && (
          <div className="space-y-6 pt-10 border-t border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
              <div>
                <p
                  className={`font-black text-xs uppercase tracking-widest ${previewItems.length < requestedCount ? "text-rose-400" : "text-indigo-400"}`}
                >
                  Preview ({previewItems.length}/{requestedCount} Soal)
                  {previewItems.length < requestedCount && " ⚠️"}
                </p>
                <p className="text-[10px] text-slate-500 font-bold mt-1 italic">
                  *Periksa kembali sebelum digunakan
                </p>
              </div>
              <button
                onClick={() => {
                  const finalData: any = { template: template };

                  // 🧠 DISTRIBUTOR DATA KE FORMAT MASING-MASING BUILDER
                  if (template === "FLASHCARD") {
                    finalData.cards = previewItems.map((item) => ({
                      front: item.front || item.word || item.question || "",
                      back: item.back || item.answer || "",
                    }));
                  } else if (
                    template === "MAZE_CHASE" ||
                    template === "SPIN_THE_WHEEL" ||
                    template === "SPIN_WHEEL"
                  ) {
                    finalData.questions = previewItems;
                  } else if (template === "MULTIPLE_CHOICE") {
                    finalData.questions = previewItems.map((item) => ({
                      question: item.question || item.front || "",
                      options: item.options || ["", "", "", ""],
                      correctAnswer: item.correctAnswer || "",
                    }));
                  } else if (template === "TRUE_FALSE") {
                    finalData.questions = previewItems.map((item) => ({
                      question: item.question || item.front || "",
                      correctAnswer:
                        typeof item.correctAnswer === "boolean"
                          ? item.correctAnswer
                          : true,
                    }));
                  } else if (template === "MATCHING") {
                    // ✅ AI-08: Mapping MATCHING diperkuat dengan fallback key yang lebih lengkap
                    finalData.pairs = previewItems.map((item) => ({
                      leftItem:
                        item.leftItem ||
                        item.left ||
                        item.term ||
                        item.question ||
                        item.front ||
                        item.kiri ||
                        "",
                      rightItem:
                        item.rightItem ||
                        item.right ||
                        item.definition ||
                        item.answer ||
                        item.back ||
                        item.kanan ||
                        "",
                      hint: item.hint || "",
                    }));
                  } else if (template === "ESSAY") {
                    finalData.questions = previewItems.map((item) => ({
                      question: item.question || item.front || "",
                      keywords: Array.isArray(item.keywords)
                        ? item.keywords
                        : [],
                    }));
                  } else {
                    // Default untuk ANAGRAM, HANGMAN, WORD_SEARCH
                    finalData.words = previewItems.map((item) => ({
                      word: item.word || item.front || item.answer || "",
                      hint: item.hint || item.back || "",
                    }));
                  }

                  onFinish(finalData);
                  setItemsList([]);
                  setTopic("");
                  setCountWarning(null);
                }}
                className="bg-emerald-500 hover:bg-emerald-400 text-white px-10 py-4 rounded-full font-black shadow-lg transition-all active:scale-95"
              >
                GUNAKAN SOAL ✓
              </button>
            </div>

            {/* PREVIEW CARDS */}
            <div className="grid grid-cols-1 gap-4 max-h-[350px] overflow-y-auto pr-4 custom-scrollbar">
              {previewItems.map((q: any, i: number) => (
                <div
                  key={i}
                  className="bg-white/5 border border-white/10 p-5 rounded-[2rem] flex items-start gap-4 hover:bg-white/10 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-400 border border-white/5 shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-200 text-base">
                      {q.question || q.front || q.hint || q.leftItem || q.word}
                    </p>

                    {/* Ekstra Preview untuk Pilihan Ganda */}
                    {q.options && Array.isArray(q.options) && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {q.options.map((opt: string, idx: number) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-1 bg-white/5 text-slate-300 rounded-lg border border-white/10"
                          >
                            {["A", "B", "C", "D"][idx]}. {opt}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Ekstra Preview untuk Essay */}
                    {q.keywords && Array.isArray(q.keywords) && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {q.keywords.map((kw: string, idx: number) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded-lg border border-indigo-500/30"
                          >
                            🔑 {kw}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Matching extra preview removed to avoid redundancy */}
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-3 bg-emerald-400/10 inline-block px-3 py-1 rounded-full border border-emerald-400/20">
                      Jawaban:{" "}
                      {q.back ||
                        q.answer ||
                        q.word ||
                        q.rightItem ||
                        (typeof q.correctAnswer === "boolean"
                          ? q.correctAnswer
                            ? "BENAR"
                            : "SALAH"
                          : q.correctAnswer) ||
                        "Penilaian Berbasis Kata Kunci (Smart AI)"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
