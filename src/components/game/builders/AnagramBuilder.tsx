import { useState } from "react"

export default function AnagramBuilder({ onSave }: any) {

    const [title, setTitle] = useState("")
    const [level, setLevel] = useState("SD")

    const [words, setWords] = useState([""])

    function updateWord(i: number, value: string) {

        const list = [...words]
        list[i] = value
        setWords(list)

    }

    function addWord() {

        setWords([...words, ""])

    }

    function publish() {

        onSave({
            template: "anagram",
            title,
            level,
            words,
            status: "published"
        })

    }

    function saveDraft() {

        onSave({
            template: "anagram",
            title,
            level,
            words,
            status: "draft"
        })

    }

    return (

        <div className="space-y-6">

            <h2 className="text-2xl font-bold">
                Create Anagram Game
            </h2>

            <input
                className="border p-3 w-full"
                placeholder="Activity Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />

            <select
                className="border p-2"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
            >
                <option>SD</option>
                <option>SMP</option>
                <option>SMA</option>
                <option>UNIVERSITY</option>
            </select>

            {words.map((w, i) => (
                <input
                    key={i}
                    className="border p-2 w-full"
                    placeholder={`Word ${i + 1}`}
                    value={w}
                    onChange={(e) => updateWord(i, e.target.value)}
                />
            ))}

            <button
                onClick={addWord}
                className="bg-gray-200 px-4 py-2"
            >
                Add Word
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