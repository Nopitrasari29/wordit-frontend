import React from "react";

// 1. Definisikan interface Props agar TypeScript tahu tipe data 'answer'
interface Props {
  answer: string;
}

export default function DraggableAnswer({ answer }: Props) {
    
    // 2. Buat fungsi handleDragStart untuk menangani logika drag
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        // Menyimpan data jawaban ke dalam dataTransfer agar bisa dibaca saat drop
        e.dataTransfer.setData("text/plain", answer);
    };

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