import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getGames, getGameById } from "../services/game.service"
import { templateIcons } from "../../data/templateIcons"
import { useAuth } from "../../hooks/useAuth"
import { toast } from "react-hot-toast"

export default function ExplorePage() {
  const [games, setGames] = useState<any[]>([])
  const [level, setLevel] = useState<string>("ALL")
  const [loading, setLoading] = useState(true)

  // State pagination
  const [page, setPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)

  // State untuk Preview Modal
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null)
  const [previewGame, setPreviewGame] = useState<any>(null)
  const [loadingPreview, setLoadingPreview] = useState(false)

  const { user } = useAuth()
  const isTeacherOrSchoolAdmin = user?.role === "TEACHER" || user?.role === "SCHOOL_ADMIN"
  const navigate = useNavigate()

  const [search, setSearch] = useState<string>("")
  const [debouncedSearch, setDebouncedSearch] = useState<string>("")
  const [classGrade, setClassGrade] = useState<string>("ALL")
  const [subject, setSubject] = useState<string>("")
  const [debouncedSubject, setDebouncedSubject] = useState<string>("")

  // Debounce search and subject inputs
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
      setDebouncedSubject(subject)
    }, 500)

    return () => {
      clearTimeout(handler)
    }
  }, [search, subject])

  async function loadGames(levelFilter?: string, searchFilter?: string, classFilter?: string, subjectFilter?: string, pageNumber?: number) {
    setLoading(true)
    try {
      const activePage = pageNumber !== undefined ? pageNumber : page
      const params: any = {
        page: activePage,
        limit: 12, // 12 item per halaman agar grid 3x4 rapi
      }
      const activeLevel = levelFilter !== undefined ? levelFilter : level
      const activeSearch = searchFilter !== undefined ? searchFilter : debouncedSearch
      const activeClass = classFilter !== undefined ? classFilter : classGrade
      const activeSubject = subjectFilter !== undefined ? subjectFilter : debouncedSubject

      if (activeLevel && activeLevel !== "ALL") {
        params.educationLevel = activeLevel
      }
      if (activeSearch.trim()) {
        params.search = activeSearch.trim()
      }
      if (activeClass && activeClass !== "ALL") {
        params.classGrade = activeClass
      }
      if (activeSubject.trim()) {
        params.subject = activeSubject.trim()
      }
      
      // Ambil games beserta pagination metadata
      const res = await getGames(params, true)

      if (res && res.games && Array.isArray(res.games)) {
        setGames(res.games)
        setTotalPages(res.pagination?.totalPages || 1)
      } else if (Array.isArray(res)) {
        setGames(res)
        setTotalPages(1)
      } else {
        setGames([])
        setTotalPages(1)
      }
    } catch (err) {
      console.error("Gagal memuat game:", err)
      setGames([])
      setTotalPages(1)
    }
    setLoading(false)
  }

  // Trigger saat filter berubah: Reset halaman ke 1
  useEffect(() => {
    setPage(1)
    loadGames(level, debouncedSearch, classGrade, debouncedSubject, 1)
  }, [level, debouncedSearch, classGrade, debouncedSubject])

  // Trigger saat halaman berubah secara eksplisit
  useEffect(() => {
    loadGames(level, debouncedSearch, classGrade, debouncedSubject, page)
  }, [page])

  // Fetch detail game saat modal terpilih
  useEffect(() => {
    async function fetchPreview() {
      if (!selectedGameId) {
        setPreviewGame(null)
        return
      }
      try {
        setLoadingPreview(true)
        const fullGame = await getGameById(selectedGameId)
        setPreviewGame(fullGame)
      } catch (err) {
        console.error("Gagal mengambil detail preview kuis:", err)
        toast.error("Gagal memuat detail kuis.")
        setSelectedGameId(null)
      } finally {
        setLoadingPreview(false)
      }
    }
    fetchPreview()
  }, [selectedGameId])

  function filterLevel(lvl: string) {
    setLevel(lvl)
  }

  // Render detail soal di modal preview
  function renderQuestionsPreview(game: any) {
    const config = Array.isArray(game.gameJson) ? game.gameJson[0] : game.gameJson
    if (!config) return <p className="text-xs text-slate-400 italic">Format soal tidak didukung.</p>

    const type = game.templateType.toUpperCase()

    // 1. Multiple Choice / True-False / Spin the Wheel / Maze Chase / Essay (questions list)
    if (config.questions && Array.isArray(config.questions)) {
      return config.questions.map((q: any, idx: number) => (
        <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left">
          <p className="font-bold text-slate-700 text-sm">{idx + 1}. {q.question}</p>
          
          {/* Multiple choice options */}
          {type === "MULTIPLE_CHOICE" && q.options && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              {q.options.map((opt: string, oIdx: number) => {
                const isCorrect = opt === q.correctAnswer
                return (
                  <span 
                    key={oIdx} 
                    className={`text-xs px-3 py-1.5 rounded-xl border ${
                      isCorrect && isTeacherOrSchoolAdmin
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold"
                        : "bg-white text-slate-500 border-slate-100"
                    }`}
                  >
                    {opt} {isCorrect && isTeacherOrSchoolAdmin && "✓"}
                  </span>
                )
              })}
            </div>
          )}

          {/* True / False answer */}
          {type === "TRUE_FALSE" && (
            <div className="mt-2 flex gap-2">
              <span className={`text-xs px-4 py-1.5 rounded-xl border ${
                q.correctAnswer === true && isTeacherOrSchoolAdmin
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold"
                  : "bg-white text-slate-400 border-slate-100"
              }`}>
                Benar
              </span>
              <span className={`text-xs px-4 py-1.5 rounded-xl border ${
                q.correctAnswer === false && isTeacherOrSchoolAdmin
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold"
                  : "bg-white text-slate-400 border-slate-100"
              }`}>
                Salah
              </span>
            </div>
          )}

          {/* Essay rubric keywords */}
          {type === "ESSAY" && q.keywords && (
            <div className="mt-2 flex flex-wrap gap-1.5 items-center">
              <span className="text-[10px] text-slate-400 font-bold mr-1">Kata Kunci AI:</span>
              {q.keywords.map((kw: string, kwIdx: number) => (
                <span key={kwIdx} className="bg-indigo-50 text-indigo-600 text-[10px] px-2 py-0.5 rounded-md font-bold">
                  {kw}
                </span>
              ))}
            </div>
          )}
        </div>
      ))
    }

    // 2. Matching (pairs list)
    if (config.pairs && Array.isArray(config.pairs)) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-left">
          {config.pairs.map((p: any, idx: number) => (
            <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between text-xs font-semibold">
              <span className="text-indigo-600 font-bold">{p.leftItem}</span>
              <span className="text-slate-400 px-2">↔</span>
              <span className="text-slate-600 font-bold">{p.rightItem}</span>
            </div>
          ))}
        </div>
      )
    }

    // 3. Anagram / Hangman / Word Search (words list)
    if (config.words && Array.isArray(config.words)) {
      return config.words.map((w: any, idx: number) => (
        <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-left flex justify-between items-center text-xs">
          <div>
            <span className="text-slate-400 font-bold mr-2">Hint:</span>
            <span className="font-semibold text-slate-600">{w.hint || "Cari kata berikut"}</span>
          </div>
          <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-lg font-black uppercase tracking-wider">
            {w.word}
          </span>
        </div>
      ))
    }

    // 4. Flashcard (cards list)
    if (config.cards && Array.isArray(config.cards)) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-left">
          {config.cards.map((c: any, idx: number) => (
            <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between text-xs font-semibold">
              <span className="text-indigo-600 font-bold">{c.front}</span>
              <span className="text-slate-400 px-2">➔</span>
              <span className="text-slate-600 font-bold">{c.back}</span>
            </div>
          ))}
        </div>
      )
    }

    return <p className="text-xs text-slate-400 italic">Tidak ada pratinjau konten.</p>
  }

  return (
    <div className="min-h-screen font-sans pb-24">

      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-[2.5rem] p-8 md:p-12 text-white shadow-xl shadow-indigo-200 mb-10 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
        <h1 className="text-4xl md:text-5xl font-black mb-3 relative z-10 tracking-tight">
          Eksplor Games 🚀
        </h1>
        <p className="text-indigo-100 font-semibold text-lg relative z-10">
          Temukan dan mainkan ribuan kuis seru buatan guru di sini.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-0">
        {/* SEARCH & FILTERS BAR */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* SEARCH BAR */}
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Cari judul kuis..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border-2 border-slate-100 focus:border-indigo-500 focus:bg-white pl-12 pr-6 py-4 rounded-[1.5rem] text-sm font-bold outline-none transition-all text-slate-700 shadow-sm placeholder:text-slate-400"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 select-none pointer-events-none">
              🔍
            </div>
          </div>

          {/* SUBJECT FILTER */}
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Cari mata pelajaran (cth: IPA)..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-white border-2 border-slate-100 focus:border-indigo-500 focus:bg-white pl-12 pr-6 py-4 rounded-[1.5rem] text-sm font-bold outline-none transition-all text-slate-700 shadow-sm placeholder:text-slate-400"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 select-none pointer-events-none">
              📚
            </div>
          </div>

          {/* CLASS/GRADE FILTER */}
          <div className="relative w-full">
            <select
              value={classGrade}
              onChange={(e) => setClassGrade(e.target.value)}
              className="w-full bg-white border-2 border-slate-100 focus:border-indigo-500 focus:bg-white px-6 py-4 rounded-[1.5rem] text-sm font-bold outline-none transition-all text-slate-700 shadow-sm cursor-pointer appearance-none"
            >
              <option value="ALL">Semua Kelas</option>
              {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((grade) => (
                <option key={grade} value={grade}>Kelas {grade}</option>
              ))}
            </select>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              ▼
            </div>
          </div>
        </div>
        {/* FILTER BUTTONS */}
        <div className="flex gap-3 flex-wrap mb-10">
          {["SD", "SMP", "SMA", "UNIVERSITY", "ALL"].map(lvl => (
            <button
              key={lvl}
              onClick={() => filterLevel(lvl)}
              className={`px-6 py-3 rounded-full font-bold transition-all duration-300 shadow-sm ${level === lvl
                  ? "bg-indigo-600 text-white shadow-[0_8px_20px_rgba(79,70,229,0.3)] -translate-y-1"
                  : "bg-white text-slate-600 border border-slate-100 hover:bg-indigo-50 hover:text-indigo-600"
                }`}
            >
              {lvl === "ALL" ? "Semua Level" : lvl}
            </button>
          ))}
        </div>

        {/* GAME LIST */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {loading ? (
            Array(6).fill(null).map((_, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-[2rem] border border-slate-100 flex flex-col animate-pulse"
              >
                <div className="bg-slate-100 h-32 rounded-[1.5rem] mb-6"></div>
                <div className="h-6 bg-slate-200 rounded-md mb-3 w-3/4"></div>
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-5 bg-slate-100 rounded-full w-20"></div>
                  <div className="h-5 bg-slate-100 rounded-full w-12"></div>
                </div>
                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="h-4 bg-slate-100 rounded-md w-24"></div>
                  <div className="h-6 bg-slate-100 rounded-full w-16"></div>
                </div>
              </div>
            ))
          ) : games.length === 0 ? (
            <div className="col-span-full bg-white p-12 rounded-[2.5rem] border border-slate-100 text-center shadow-sm">
              <span className="text-5xl mb-4 block">🔍</span>
              <h3 className="text-xl font-black text-slate-800">Tidak Ada Game Tersedia</h3>
              <p className="text-slate-400 font-bold text-sm mt-2">Belum ada game yang dipublikasikan untuk kategori ini.</p>
            </div>
          ) : (
            games.map(game => (
              <div
                key={game.id}
                onClick={() => setSelectedGameId(game.id)}
                className="bg-white p-6 rounded-[2rem] shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300 hover:-translate-y-2 cursor-pointer flex flex-col group text-left"
              >
                {/* BIG ICON AREA */}
                <div className="bg-slate-100 h-32 rounded-[1.5rem] mb-6 flex items-center justify-center text-5xl group-hover:scale-105 transition-transform duration-300">
                  {templateIcons[game.templateType] || "🎮"}
                </div>

                {/* TITLE */}
                <h2 className="font-black text-xl text-slate-800 mb-3 truncate">
                  {game.title}
                </h2>

                {/* TAGS */}
                <div className="flex items-center gap-2 mb-6 flex-wrap">
                  <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold capitalize">
                    {game.templateType.replaceAll("_", " ").toLowerCase()}
                  </span>
                  <span className="bg-slate-50 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
                    {game.educationLevel}
                  </span>
                  {game.classGrade && (
                    <span className="bg-violet-50 text-violet-600 px-3 py-1 rounded-full text-xs font-bold">
                      Kelas {game.classGrade}
                    </span>
                  )}
                  {game.subject && (
                    <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold truncate max-w-[120px]" title={game.subject}>
                      {game.subject}
                    </span>
                  )}
                </div>

                {/* CTA BUTTON */}
                <div className="mb-4 mt-auto">
                  <span className="w-full inline-block bg-indigo-600 group-hover:bg-indigo-700 text-white font-black text-center text-xs py-3 rounded-2xl transition-all shadow-md group-hover:shadow-lg active:scale-98">
                    Lihat Detail & Main 🚀
                  </span>
                </div>

                {/* FOOTER AREA */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <p className="text-xs text-slate-400 font-bold">
                    Diff: <span className="text-slate-600">{game.difficulty}</span>
                  </p>
                  <p className="text-xs text-indigo-500 font-black bg-indigo-50 px-3 py-1.5 rounded-full">
                    ▶ {game.playCount || 0} plays
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* PAGINATION CONTROLS */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12 bg-white/60 backdrop-blur-md border border-slate-100 p-4 rounded-3xl w-fit mx-auto shadow-sm">
            <button
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="flex items-center justify-center w-10 h-10 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-600 transition-all font-bold cursor-pointer"
            >
              ←
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => {
              if (totalPages > 5 && Math.abs(p - page) > 1 && p !== 1 && p !== totalPages) {
                if (p === 2 || p === totalPages - 1) {
                  return <span key={p} className="text-slate-400 px-1 font-bold">...</span>;
                }
                return null;
              }
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-2xl font-black text-sm transition-all cursor-pointer ${
                    page === p
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-105"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600"
                  }`}
                >
                  {p}
                </button>
              );
            })}

            <button
              onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
              className="flex items-center justify-center w-10 h-10 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-600 transition-all font-bold cursor-pointer"
            >
              →
            </button>
          </div>
        )}
      </div>

      {/* GAME PREVIEW MODAL */}
      {selectedGameId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-start">
              <div className="flex gap-4">
                <div className="bg-slate-100 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                  {previewGame ? (templateIcons[previewGame.templateType] || "🎮") : "⚙️"}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">
                    {loadingPreview ? "Memuat Kuis..." : previewGame?.title}
                  </h2>
                  <p className="text-slate-400 font-bold text-xs mt-1">
                    {loadingPreview ? "Sedang memuat data dari server..." : `Dibuat oleh: ${previewGame?.creator?.name || "Official WordIT"}`}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedGameId(null)}
                className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-all"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6">
              {loadingPreview ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
                  <p className="text-slate-400 text-sm font-bold">Sedang menyiapkan soal kuis...</p>
                </div>
              ) : (
                previewGame && (
                  <>
                    {/* Deskripsi & Meta */}
                    <div>
                      <h3 className="text-xs font-black text-indigo-400 uppercase tracking-wider mb-2">Deskripsi</h3>
                      <p className="text-slate-600 font-medium text-sm leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        {previewGame.description || "Tidak ada deskripsi untuk game ini."}
                      </p>
                    </div>

                    {/* Tag & Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-indigo-50 p-3 rounded-2xl text-center border border-indigo-100">
                        <span className="block text-[10px] font-black text-indigo-400 uppercase">Tipe Game</span>
                        <span className="text-xs font-black text-indigo-700 capitalize">{previewGame.templateType.replaceAll("_", " ").toLowerCase()}</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl text-center border border-slate-100">
                        <span className="block text-[10px] font-black text-slate-400 uppercase">Jenjang</span>
                        <span className="text-xs font-black text-slate-700">{previewGame.educationLevel}</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl text-center border border-slate-100">
                        <span className="block text-[10px] font-black text-slate-400 uppercase">Kesulitan</span>
                        <span className="text-xs font-black text-slate-700">{previewGame.difficulty}</span>
                      </div>
                      <div className="bg-emerald-50 p-3 rounded-2xl text-center border border-emerald-100">
                        <span className="block text-[10px] font-black text-emerald-400 uppercase">Dimainkan</span>
                        <span className="text-xs font-black text-emerald-700">{previewGame.playCount || 0} Kali</span>
                      </div>
                    </div>

                    {/* Soal Preview */}
                    <div>
                      <h3 className="text-xs font-black text-indigo-400 uppercase tracking-wider mb-3">Tinjauan Soal</h3>
                      <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                        {renderQuestionsPreview(previewGame)}
                      </div>
                    </div>
                  </>
                )
              )}
            </div>

            {/* Modal Footer Actions */}
            {!loadingPreview && previewGame && (
              <div className="p-6 md:p-8 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-3 justify-end">
                {isTeacherOrSchoolAdmin ? (
                  <>
                    <button 
                      onClick={() => {
                        setSelectedGameId(null)
                        navigate(`/play/${previewGame.id}`)
                      }}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-black px-6 py-3.5 rounded-full transition-all text-sm uppercase tracking-wider"
                    >
                      Coba Main (Solo)
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedGameId(null)
                        navigate(`/teacher/session/host/${previewGame.id}`)
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-3.5 rounded-full shadow-lg shadow-indigo-200 transition-all text-sm uppercase tracking-wider"
                    >
                      Host Live Game 🚀
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => {
                      setSelectedGameId(null)
                      navigate(`/play/${previewGame.id}`)
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 py-3.5 rounded-full shadow-lg shadow-indigo-200 transition-all text-sm uppercase tracking-wider w-full sm:w-auto"
                  >
                    Mulai Bermain Solo ▶
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}