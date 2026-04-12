import { Link } from "react-router-dom"
import { templates } from "../../data/templates"

export default function LandingPage() {

    return (

        <div className="space-y-16 page-enter">

            <section className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-xl p-16 text-center">

                <h1 className="text-5xl font-bold mb-4">
                    Gamified Learning Platform
                </h1>

                <p className="opacity-90 mb-8">
                    Create interactive learning games for your class
                </p>

                <div className="flex justify-center gap-4">

                    <Link
                        to="/explore"
                        className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold"
                    >
                        Explore Templates
                    </Link>

                    <Link
                        to="/game/choose-level"
                        className="bg-green-500 px-6 py-3 rounded-lg font-semibold"
                    >
                        Create Game
                    </Link>

                </div>

            </section>

            <section>

                <h2 className="text-2xl font-bold mb-6">
                    Game Templates
                </h2>

                <div className="grid md:grid-cols-3 gap-6">

                    {templates.slice(0, 6).map(game => (

                        <div
                            key={game.id}
                            className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
                        >

                            <h3 className="font-semibold text-lg mb-2">
                                {game.name}
                            </h3>

                            <div className="flex flex-wrap gap-2">

                                {game.levels.map(level => (

                                    <span
                                        key={level}
                                        className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded"
                                    >
                                        {level}
                                    </span>

                                ))}

                            </div>

                        </div>

                    ))}

                </div>

            </section>

        </div>

    )

}