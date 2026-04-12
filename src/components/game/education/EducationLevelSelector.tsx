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

        <div className="grid md:grid-cols-4 gap-6">

            {levels.map((level) => (

                <EducationLevelCard
                    key={level.id}
                    level={level.title}
                    description={level.desc}
                    onSelect={() => handleSelect(level.id)}
                />

            ))}

        </div>

    )

}