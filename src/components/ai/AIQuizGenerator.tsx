import { useState } from "react";
import { toast } from "react-hot-toast";
import { generateGameWithAI } from "../../pages/services/ai.service";

interface AIProps {
  level: string;
  template: string;
  onFinish: (data: any) => void;
  // ✅ FE-17: Terima requestedCount dari parent agar bisa validasi strict count
  requestedCount?: number;
}

export default function AIQuizGenerator({
  level,
  template,
  onFinish,
  requestedCount = 5,
}: AIProps) {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  // ✅ FE-17: State untuk peringatan jumlah soal tidak sesuai
  const [countWarning, setCountWarning] = useState<string | null>(null);

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
      setResult(response);

      // ✅ FE-17: Validasi strict count — tampilkan peringatan jika soal kurang
      const items = getNormalizedItems(response);
      if (items.length < requestedCount) {
        setCountWarning(
          `AI hanya menghasilkan ${items.length} soal dari ${requestedCount} yang diminta. Kamu tetap bisa menggunakan soal ini atau klik Generate ulang.`,
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

  const previewItems = getNormalizedItems(result);

  return (
    <div className="bg-[#0f172a] p-8 md:p-12 rounded-[3rem] text-white shadow-2xl relative overflow-hidden border border-white/5 font-sans">
      <div className="relative z-10">
        <div className="mb-6">
          <h2 className="text-3xl font-black mb-2 italic flex items-center gap-3">
            Magic Generator <span className="text-indigo-400">✨</span>
          </h2>
          <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">
            Merancang kuis {template.replace(/_/g, " ")} • Level {level} •{" "}
            {requestedCount} Soal
          </p>
        </div>

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

        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <input
            placeholder="Ketik topik kuis (Misal: Ekosistem Laut)..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && generate()}
            className="flex-1 bg-white/10 border-2 border-white/5 px-8 py-4 rounded-full outline-none focus:border-indigo-500 transition-all font-bold text-lg text-white"
          />
          <button
            onClick={generate}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black px-10 py-4 rounded-full transition-all active:scale-95 whitespace-nowrap shadow-lg shadow-indigo-500/20"
          >
            {loading ? "AI Lagi Mikir..." : "Generate Magic 🪄"}
          </button>
        </div>

        {/* ✅ FE-17: Banner peringatan jika soal kurang dari yang diminta */}
        {countWarning && (
          <div className="mb-6 bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-start gap-4">
            <span className="text-xl shrink-0">⚠️</span>
            <div className="flex-1">
              <p className="text-[12px] text-rose-200/90 font-bold leading-relaxed">
                {countWarning}
              </p>
              <button
                onClick={generate}
                disabled={loading}
                className="mt-3 text-[11px] font-black text-rose-300 hover:text-white bg-rose-500/20 hover:bg-rose-500/40 px-4 py-2 rounded-full transition-all border border-rose-500/30 disabled:opacity-50"
              >
                {loading ? "Generating..." : "🔄 Generate Ulang"}
              </button>
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
                  setResult(null);
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
                        "Sesuai Keyword"}
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
