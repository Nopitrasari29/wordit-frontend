export default function EditGamePage() {

    return (

        <div className="space-y-6">

            <h1 className="text-3xl font-bold">
                Edit Game
            </h1>

            <input
                placeholder="Game Title"
                className="border p-3 w-full rounded"
            />

            <select className="border p-3 w-full rounded">

                <option>Quiz</option>
                <option>True or False</option>
                <option>Flashcard</option>
                <option>Matching Pair</option>
                <option>Word Search</option>
                <option>Anagram</option>
                <option>Short Answer</option>
                <option>Speed Sort</option>
                <option>Wheel</option>

            </select>

            <button className="bg-blue-600 text-white px-4 py-2 rounded">

                Save Changes

            </button>

        </div>

    )

}