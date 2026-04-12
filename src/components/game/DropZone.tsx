type Props = {
    label: string
    onDropAnswer?: (answer: string) => void
}

export default function DropZone({ label, onDropAnswer }: Props) {

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {

        e.preventDefault()

        const answer = e.dataTransfer.getData("answer")

        if (onDropAnswer) {

            onDropAnswer(answer)

        }

    }

    const allowDrop = (e: React.DragEvent<HTMLDivElement>) => {

        e.preventDefault()

    }

    return (

        <div
            onDrop={handleDrop}
            onDragOver={allowDrop}
            className="border-2 border-dashed border-gray-400 p-6 rounded-lg text-center bg-gray-50"
        >

            {label}

        </div>

    )

}