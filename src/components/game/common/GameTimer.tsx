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

        <div className="text-xl font-bold text-indigo-600">

            Time: {time}s

        </div>

    )

}