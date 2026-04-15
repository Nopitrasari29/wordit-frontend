import { useEffect, useState } from "react"

type Props = {
    seconds: number
    onTimeUp: () => void
}

export default function GameTimer({ seconds, onTimeUp }: Props) {
    const [time, setTime] = useState(seconds)

    useEffect(() => {
        setTime(seconds)
    }, [seconds])

    useEffect(() => {
        if (time <= 0) {
            onTimeUp()
            return
        }

        const interval = setInterval(() => {
            setTime((t) => t - 1)
        }, 1000)

        return () => clearInterval(interval)
    }, [time, onTimeUp])

    return (
        <div className="flex items-center justify-center font-sans">
            <div
                className={`
                    px-6 py-2 rounded-full font-black text-xl shadow-md border-4 border-white transition-all duration-300
                    ${time < 5
                        ? 'bg-rose-500 text-white animate-pulse scale-110 shadow-rose-200'
                        : 'bg-amber-400 text-amber-900 shadow-amber-100'
                    }
                `}
            >
                <span className="mr-2">⏱️</span>
                {time}s
            </div>
        </div>
    )
}