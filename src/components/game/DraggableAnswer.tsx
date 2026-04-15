export default function DraggableAnswer({ answer }: Props) {
    return (
        <div
            draggable
            onDragStart={handleDragStart}
            className="bg-white border-2 border-slate-100 text-slate-800 px-8 py-4 rounded-2xl cursor-move shadow-sm hover:shadow-xl hover:border-indigo-500 hover:-translate-y-1 transition-all font-black text-lg active:scale-95"
        >
            {answer}
        </div>
    )
}