import { useNavigate, useSearchParams } from "react-router-dom"

const levels = ["SD", "SMP", "SMA", "UNIVERSITY"]

export default function ChooseLevelPage() {

  const navigate = useNavigate()
  const [params] = useSearchParams()

  const template = params.get("template")

  function selectLevel(level: string) {

    navigate(`/teacher/create?template=${template}&level=${level}`)

  }

  return (

    <div className="max-w-4xl mx-auto py-10 px-6">

      <h1 className="text-3xl font-bold mb-8">
        Choose Education Level
      </h1>

      <div className="grid md:grid-cols-2 gap-6">

        {levels.map((level) => (

          <button
            key={level}
            onClick={() => selectLevel(level)}
            className="p-6 border rounded-xl hover:bg-gray-50"
          >
            {level}
          </button>

        ))}

      </div>

    </div>

  )

}