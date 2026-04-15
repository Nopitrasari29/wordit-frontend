import Hero from "../../components/ui/Hero"
import FeatureCard from "../../components/ui/FeatureCard"

export default function LandingPage() {
  return (
    <div className="bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Hero />

      {/* FEATURES SECTION */}
      {/* Perhatikan bg-slate-50 ini yang warnanya kita samakan dengan ujung Wave di Hero */}
      <section className="bg-slate-50 py-16 md:py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-12 text-slate-800 tracking-tight">
            Why Teachers Love WordIT
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <FeatureCard
              title="Interactive Templates"
              desc="Create games like Flashcards, Hangman, Word Search and more in seconds."
              icon="🎮"
            />
            <FeatureCard
              title="Real-Time Gameplay"
              desc="Students can join via codes and compete in thrilling real-time sessions."
              icon="⚡"
            />
            <FeatureCard
              title="Analytics Dashboard"
              desc="Track student progress, identify weak points, and monitor performance."
              icon="📊"
            />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="bg-white py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-slate-800 tracking-tight">
              How WordIT Works
            </h2>
            <p className="text-slate-500 text-lg">Three simple steps to bring your classroom to life.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Garis penghubung (hanya terlihat di Desktop) */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-slate-100 -z-10"></div>

            {/* Step 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white border-4 border-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-xl font-bold shadow-sm mb-6">1</div>
              <h3 className="text-xl font-bold mb-3 text-slate-800">Choose Template</h3>
              <p className="text-slate-500">Pick a game template suitable for your lesson plan and subject.</p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white border-4 border-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-xl font-bold shadow-sm mb-6">2</div>
              <h3 className="text-xl font-bold mb-3 text-slate-800">Add Questions</h3>
              <p className="text-slate-500">Fill in your own engaging questions, answers, and images.</p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-indigo-600 border-4 border-indigo-100 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-md mb-6">3</div>
              <h3 className="text-xl font-bold mb-3 text-slate-800">Play & Learn</h3>
              <p className="text-slate-500">Share the pin. Students join the game and compete together.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="bg-white pb-20 md:pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto bg-slate-900 rounded-[2rem] md:rounded-[3rem] p-10 sm:p-16 md:p-20 text-center relative overflow-hidden">

          {/* Efek Gradasi di dalam CTA */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-blue-600/20 mix-blend-overlay"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 opacity-20 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 opacity-20 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>

          <h2 className="text-3xl md:text-5xl font-extrabold mb-6 text-white relative z-10 tracking-tight">
            Ready to gamify your classroom?
          </h2>
          <p className="text-slate-300 mb-10 text-lg max-w-2xl mx-auto relative z-10">
            Join thousands of teachers using WordIT to make learning fun, interactive, and impactful.
          </p>

          <a
            href="/register"
            className="inline-block bg-indigo-500 hover:bg-indigo-400 text-white px-8 md:px-10 py-3.5 md:py-4 rounded-full font-bold shadow-lg hover:shadow-indigo-500/30 transition-all hover:-translate-y-1 relative z-10"
          >
            Get Started for Free
          </a>
        </div>
      </section>
    </div>
  )
}