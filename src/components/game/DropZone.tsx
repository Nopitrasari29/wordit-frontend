import React from "react";

// 1. Definisikan interface Props agar TypeScript tenang
interface Props {
    label: string;
    onDropAnswer: (answer: string) => void;
}

export default function DropZone({ label, onDropAnswer }: Props) {
    
    // 2. Fungsi untuk mengizinkan drop (default-nya browser itu melarang drop)
    const allowDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    // 3. Fungsi untuk menangkap data saat jawaban dilepas di sini
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        // Ambil data teks yang dikirim oleh DraggableAnswer tadi
        const answer = e.dataTransfer.getData("text/plain");
        if (answer) {
            onDropAnswer(answer);
        }
    };

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