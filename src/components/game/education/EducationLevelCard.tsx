type Props = {
    level: string
    description?: string
    onSelect: (level: string) => void
}

export default function EducationLevelCard({
    level,
    description,
    onSelect
}: Props) {

    return (

        <div
            onClick={() => onSelect(level)}
            className="border rounded-xl p-6 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition bg-white"
        >

            <h2 className="text-xl font-bold mb-2">
                {level}
            </h2>

            {description && (
                <p className="text-gray-500 text-sm">
                    {description}
                </p>
            )}

        </div>

    )

}