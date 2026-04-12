interface Props {
    level: string;
}

export default function EducationBadge({ level }: Props) {
    const colors: any = {
        SD: "bg-green-500",
        SMP: "bg-blue-500",
        SMA: "bg-purple-500",
        UNIVERSITY: "bg-red-500",
    };

    return (
        <span
            className={`text-white text-xs px-2 py-1 rounded ${colors[level] || "bg-gray-500"
                }`}
        >
            {level}
        </span>
    );
}