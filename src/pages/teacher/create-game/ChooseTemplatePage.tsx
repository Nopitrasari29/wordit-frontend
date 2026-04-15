import { useNavigate } from "react-router-dom"
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
    <div className="max-w-6xl mx-auto py-10 px-6">

      <h1 className="text-3xl font-bold mb-8">
        Choose Game Template
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {templates.map((template) => (
          <TemplateCard
            key={template.name}
            title={template.title}
            description={template.description}
            onClick={() => selectTemplate(template.name)}
          />
        ))}

      </div>

    </div>
  )
}