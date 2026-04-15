import { useNavigate } from "react-router-dom"

export default function GameCard({ id, title, templateType, educationLevel }: any) {

  const navigate = useNavigate()

  return (

    <div
      onClick={() => navigate(`/play/${id}`)}
      className="cursor-pointer bg-white p-5 rounded shadow hover:shadow-lg"
    >

      <h2 className="font-semibold text-lg">
        {title}
      </h2>

      <p className="text-gray-500 text-sm">
        {templateType} · {educationLevel}
      </p>

    </div>

  )

}