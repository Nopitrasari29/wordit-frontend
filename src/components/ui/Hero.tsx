import { Link } from "react-router-dom"
import Wave from "./Wave"

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-indigo-50 via-blue-50 to-white pt-24 pb-32 md:pt-32 md:pb-48 overflow-hidden">

      {/* Dekorasi Background */}
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-40"></div>
      <div className="absolute top-20 right-1/4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-40"></div>

      <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 relative z-10 flex flex-col items-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight text-slate-900 tracking-tight">
          Create Interactive <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
            Learning Games
          </span>
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-slate-600 mb-10 max-w-2xl leading-relaxed">
          WordIT helps teachers create engaging quizzes, activities, and interactive learning experiences with ease.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
          <Link
            to="/game/choose-level"
            className="bg-indigo-600 text-white px-8 py-3.5 rounded-full font-semibold shadow-lg shadow-indigo-200 hover:shadow-xl hover:bg-indigo-700 hover:-translate-y-1 transition-all w-full sm:w-auto text-center"
          >
            Create Game
          </Link>

          <Link
            to="/explore"
            className="bg-white text-indigo-600 border border-indigo-100 px-8 py-3.5 rounded-full font-semibold shadow-sm hover:shadow-md hover:border-indigo-200 hover:-translate-y-1 transition-all w-full sm:w-auto text-center"
          >
            Explore Games
          </Link>
        </div>
      </div>

      <Wave />
    </section>
  )
}