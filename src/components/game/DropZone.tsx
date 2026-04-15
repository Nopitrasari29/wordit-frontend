export default function DropZone({ label, onDropAnswer }: Props) {
    return (
        <div
            onDrop={handleDrop}
            onDragOver={allowDrop}
            className="border-4 border-dashed border-indigo-200 p-8 rounded-[2.5rem] text-center bg-indigo-50/30 text-indigo-400 font-black text-xl hover:bg-indigo-50 hover:border-indigo-400 transition-all duration-300"
        >
            {label}
        </div>
    )
}