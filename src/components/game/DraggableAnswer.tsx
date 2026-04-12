type Props = {
    answer: string
}

export default function DraggableAnswer({ answer }: Props) {

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {

        e.dataTransfer.setData("answer", answer)

    }

    return (

        <div
            draggable
            onDragStart={handleDragStart}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg cursor-move shadow hover:bg-blue-600 transition"
        >

            {answer}

        </div>

    )

}