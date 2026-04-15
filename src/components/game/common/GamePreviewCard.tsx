type Props = {
  title: string
  templateType: string
  educationLevel: string
}

export default function GamePreviewCard({
  title,
  templateType,
  educationLevel,
}: Props) {

  return (

    <div className="border rounded-xl p-6">

      <h3 className="font-semibold text-lg mb-2">
        {title}
      </h3>

      <p className="text-sm text-gray-500">
        {templateType} • {educationLevel}
      </p>

    </div>

  )

}