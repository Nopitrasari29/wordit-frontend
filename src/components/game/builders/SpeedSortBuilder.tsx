import { useState } from "react";

export default function SpeedSortBuilder({ onSave }: any) {

    const [title, setTitle] = useState("");
    const [level, setLevel] = useState("SD");

    const [items, setItems] = useState([
        { label: "", category: "" }
    ]);

    function updateItem(i: number, key: string, value: string) {

        const list = [...items];
        (list[i] as any)[key] = value;
        setItems(list);

    }

    function addItem() {

        setItems([...items, { label: "", category: "" }])

    }

    function publish() {

        onSave({
            template: "speedsort",
            title,
            level,
            items,
            status: "published"
        })

    }

    function saveDraft() {

        onSave({
            template: "speedsort",
            title,
            level,
            items,
            status: "draft"
        })

    }

    return (

        <div className="space-y-6">

            <h2 className="text-2xl font-bold">
                Create Speed Sort
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

            {items.map((item, i) => (
                <div key={i} className="grid grid-cols-2 gap-4">

                    <input
                        className="border p-2"
                        placeholder="Item"
                        value={item.label}
                        onChange={(e) => updateItem(i, "label", e.target.value)}
                    />

                    <input
                        className="border p-2"
                        placeholder="Category"
                        value={item.category}
                        onChange={(e) => updateItem(i, "category", e.target.value)}
                    />

                </div>
            ))}

            <button
                onClick={addItem}
                className="bg-gray-200 px-4 py-2"
            >
                Add Item
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