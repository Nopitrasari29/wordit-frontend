type Props = {
  title: string
  description: string
  onClick: () => void
}

export default function TemplateCard({
  title,
  description,
  onClick,
}: Props) {

  return (

    <div
      onClick={onClick}
      className="cursor-pointer border rounded-xl p-6 hover:shadow-lg transition"
    >

      <h2 className="text-xl font-semibold mb-2">
        {title}
      </h2>

      <p className="text-gray-600">
        {description}
      </p>

    </div>

  )

}