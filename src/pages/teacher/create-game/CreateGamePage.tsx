import GameBuilderRouter from "../../../components/game/GameBuilderRouter"

export default function CreateGamePage() {
  return (
    <div className="max-w-6xl mx-auto py-10 px-6 font-sans">
      <div className="bg-indigo-600 rounded-[3rem] p-10 text-white shadow-xl mb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <h1 className="text-4xl font-black tracking-tight relative z-10">Create New Game 🛠️</h1>
        <p className="opacity-80 font-bold mt-2 relative z-10">Rancang kuis interaktifmu sendiri dalam hitungan menit.</p>
      </div>
      <GameBuilderRouter />
    </div>
  )
}