import { useState } from "react"

export default function SpinWheelBuilder({ value, onChange }: any) {

    const [options, setOptions] = useState(value?.data?.options || [])

    function update(newOptions: any) {

        setOptions(newOptions)

        onChange({

            data: { options: newOptions }

        })

    }

    function add() {

        update([...options, { label: "" }])

    }

    return (

        <div>

            <h3>Wheel Options</h3>

            {options.map((o: any, i: number) => (

                <div key={i}>

                    <input
                        value={o.label}
                        onChange={(e) => {

                            const copy = [...options]
                            copy[i].label = e.target.value
                            update(copy)

                        }}
                    />

                </div>

            ))}

            <button onClick={add}>Add option</button>

        </div>

    )

}