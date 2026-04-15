import { useNavigate } from "react-router-dom"
import EducationLevelCard from "./EducationLevelCard"

export default function EducationLevelSelector() {
    const navigate = useNavigate()

    const levels = [
        {
            id: "SD",
            title: "SD",
            desc: "Sekolah Dasar"
        },
        {
            id: "SMP",
            title: "SMP",
            desc: "Sekolah Menengah Pertama"
        },
        {
            id: "SMA",
            title: "SMA",
            desc: "Sekolah Menengah Atas"
        },
        {
            id: "UNIVERSITY",
            title: "University",
            desc: "Perguruan Tinggi"
        }
    ]

    const handleSelect = (level: string) => {
        navigate(`/game/templates?level=${level}`)
    }

    return (
        <div className="max-w-6xl mx-auto py-10 font-sans">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight mb-4">
                    Pilih Jenjang 🎒
                </h1>
                <p className="text-slate-500 font-bold text-lg max-w-2xl mx-auto">
                    Sesuaikan materi kuis dengan tingkat pendidikan muridmu untuk pengalaman belajar yang lebih baik.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {levels.map((level) => (
                    <EducationLevelCard
                        key={level.id}
                        level={level.title}
                        description={level.desc}
                        onSelect={() => handleSelect(level.id)}
                    />
                ))}
            </div>
        </div>
    )
}