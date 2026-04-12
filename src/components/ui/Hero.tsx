import { Link } from "react-router-dom";

export default function Hero() {
    return (
        <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-28">

            <div className="max-w-6xl mx-auto text-center px-6">

                <h1 className="text-6xl font-bold mb-6">
                    Create Interactive Learning Games
                </h1>

                <p className="text-xl opacity-90 mb-10">
                    WordIT helps teachers create engaging quizzes and activities
                    for classrooms and online learning.
                </p>

                <div className="flex justify-center gap-4 flex-wrap">

                    <Link
                        to="/create-game"
                        className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:scale-105 transition"
                    >
                        Create Game
                    </Link>

                    <Link
                        to="/explore"
                        className="border border-white px-8 py-3 rounded-lg hover:bg-white hover:text-blue-600 transition"
                    >
                        Explore Games
                    </Link>

                </div>

            </div>

        </section>
    );
}