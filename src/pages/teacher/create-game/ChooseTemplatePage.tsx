import { useNavigate } from "react-router-dom"
// Asumsi TemplateCard milikmu akan digunakan atau kamu bisa modifikasi isi loop ini langsung.
import TemplateCard from "../../../components/game/TemplateCard"

const templates = [
  {
    name: "ANAGRAM",
    title: "Anagram",
    description: "Susun huruf menjadi kata yang benar",
  },
  {
    name: "FLASHCARD",
    title: "Flashcard",
    description: "Belajar menggunakan kartu interaktif",
  },
  {
    name: "HANGMAN",
    title: "Hangman",
    description: "Tebak kata sebelum karakter habis",
  },
  {
    name: "MAZE_CHASE",
    title: "Maze Chase",
    description: "Kejar jawaban yang benar di labirin",
  },
  {
    name: "SPIN_THE_WHEEL",
    title: "Spin The Wheel",
    description: "Putar roda untuk memilih soal",
  },
  {
    name: "WORD_SEARCH",
    title: "Word Search",
    description: "Cari kata dalam puzzle",
  },
]

export default function ChooseTemplatePage() {
  const navigate = useNavigate()

  function selectTemplate(template: string) {
    navigate(`/teacher/create/level?template=${template}`)
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">

      {/* HEADER BANNER */}
      <div className="bg-white px-6 py-10 md:py-16 border-b border-slate-200 shadow-sm text-center relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-40 h-40 bg-indigo-100 rounded-full blur-3xl opacity-50"></div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight mb-4">
            Pilih Template Game 🎨
          </h1>
          <p className="text-slate-500 font-semibold text-lg max-w-2xl mx-auto">
            Materi apa yang ingin kamu ajarkan hari ini? Pilih kerangka game di bawah ini untuk memulai.
          </p>
        </div>
      </div>

      {/* TEMPLATE GRID */}
      <div className="max-w-6xl mx-auto px-6 mt-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">

          {templates.map((template) => (
            <div
              key={template.name}
              onClick={() => selectTemplate(template.name)}
              className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-2 hover:border-indigo-100 transition-all duration-300 cursor-pointer flex flex-col group"
            >
              {/* Tempatkan ikon dummy untuk sementara */}
              <div className="h-32 bg-indigo-50 text-indigo-600 rounded-[1.5rem] mb-6 flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-300">
                🎮
              </div>

              <h2 className="text-2xl font-black text-slate-800 mb-3">{template.title}</h2>
              <p className="text-slate-500 font-medium leading-relaxed flex-1">
                {template.description}
              </p>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <span className="text-indigo-600 font-bold text-sm flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                  Gunakan Template <span className="text-lg">→</span>
                </span>
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  )
}