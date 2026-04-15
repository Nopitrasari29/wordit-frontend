import { useNavigate, useSearchParams } from "react-router-dom"

const levels = [
  { id: "SD", icon: "🏫", color: "hover:border-emerald-400 hover:bg-emerald-50" },
  { id: "SMP", icon: "🏢", color: "hover:border-blue-400 hover:bg-blue-50" },
  { id: "SMA", icon: "🏛️", color: "hover:border-indigo-400 hover:bg-indigo-50" },
  { id: "UNIVERSITY", icon: "🎓", color: "hover:border-rose-400 hover:bg-rose-50" }
]

export default function ChooseLevelPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const template = params.get("template")

  function selectLevel(level: string) {
    navigate(`/teacher/create?template=${template}&level=${level}`)
  }

  return (
    <div className="max-w-4xl mx-auto py-20 px-6 font-sans text-center">
      <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-4 tracking-tight">Pilih Jenjang 🎒</h1>
      <p className="text-slate-500 font-bold mb-12 text-lg">Sesuaikan tingkat kesulitan game dengan muridmu.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {levels.map((lvl) => (
          <button
            key={lvl.id}
            onClick={() => selectLevel(lvl.id)}
            className={`p-10 bg-white border-4 border-slate-100 rounded-[2.5rem] shadow-sm transition-all duration-300 flex flex-col items-center gap-4 group ${lvl.color} hover:-translate-y-2 hover:shadow-xl`}
          >
            <span className="text-5xl group-hover:scale-125 transition-transform duration-300">{lvl.icon}</span>
            <span className="text-xl font-black text-slate-700">{lvl.id}</span>
          </button>
        ))}
      </div>
    </div>
  )
}