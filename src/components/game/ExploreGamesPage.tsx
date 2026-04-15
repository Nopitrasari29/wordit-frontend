export default function ExploreGamesPage() {
  return (
    <div className="space-y-8 font-sans">
      <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
        <h1 className="text-4xl font-black mb-2 relative z-10">Eksplor Game 🌍</h1>
        <p className="text-indigo-100 font-bold relative z-10">Temukan ribuan kuis seru dari guru di seluruh dunia.</p>
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {dummyGames.map((game) => (
          <GameCard key={game.id} {...game} />
        ))}
      </div>
    </div>
  )
}