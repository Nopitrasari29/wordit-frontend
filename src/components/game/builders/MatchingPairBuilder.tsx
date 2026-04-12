import { useState } from "react"

export default function MatchingPairBuilder({ onSave }: any) {

    const [title, setTitle] = useState("")
    const [level, setLevel] = useState("SD")

    const [pairs, setPairs] = useState([
        { left: "", right: "" }
    ])

    function update(i: number, key: string, value: string) {

        const p = [...pairs]
        p[i][key] = value
        setPairs(p)

    }

    function addPair() {

        setPairs([...pairs, { left: "", right: "" }])

    }

    function publish() {

        onSave({
            template: "matching",
            title,
            level,
            pairs,
            status: "published"
        })

    }

    function saveDraft() {

        onSave({
            template: "matching",
            title,
            level,
            pairs,
            status: "draft"
        })

    }

    return (

        <div className="space-y-6">

            <h2 className="text-2xl font-bold">
                Create Matching Pair
            </h2>

            <input
                className="border p-3 w-full"
                placeholder="Activity Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />

            {pairs.map((pair, i) => (
                <div key={i} className="grid grid-cols-2 gap-4">

                    <input
                        className="border p-2"
                        placeholder="Item A"
                        value={pair.left}
                        onChange={(e) => update(i, "left", e.target.value)}
                    />

                    <input
                        className="border p-2"
                        placeholder="Item B"
                        value={pair.right}
                        onChange={(e) => update(i, "right", e.target.value)}
                    />

                </div>
            ))}

            <button
                onClick={addPair}
                className="bg-gray-200 px-4 py-2"
            >
                Add Pair
            </button>

            <div className="flex gap-4">

                <button
                    onClick={saveDraft}
                    className="bg-yellow-500 text-white px-6 py-2"
                >
                    Save Draft
                </button>

                <button
                    onClick={publish}
                    className="bg-blue-600 text-white px-6 py-2"
                >
                    Publish
                </button>

            </div>

        </div>

    )

}