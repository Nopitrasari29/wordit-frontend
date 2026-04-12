import { Link } from "react-router-dom"

export default function ResultPage() {

    return (

        <div className="text-center space-y-6">

            <h1 className="text-3xl font-bold">
                Game Result
            </h1>

            <p className="text-xl">
                Score: 80
            </p>

            <p className="text-gray-500">
                Correct Answers: 8 / 10
            </p>

            <div className="flex justify-center gap-4">

                <Link
                    to="/leaderboard"
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Leaderboard
                </Link>

                <Link
                    to="/explore"
                    className="bg-gray-600 text-white px-4 py-2 rounded"
                >
                    Back to Explore
                </Link>

            </div>

        </div>

    )

}