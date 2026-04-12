import { useState } from "react"

export default function WheelEngine({ items }: any) {

    const [result, setResult] = useState("")

    function spin() {

        const r =
            items[Math.floor(Math.random() * items.length)]

        setResult(r)

    }

    return (

        <div className="text-center">

            <h2 className="text-xl mb-6">
                Spin the Wheel
            </h2>

            <button
                onClick={spin}
                className="bg-purple-600 text-white px-6 py-3"
            >
                Spin
            </button>

            {result && (
                <p className="text-2xl mt-6">
                    {result}
                </p>
            )}

        </div>

    )

}