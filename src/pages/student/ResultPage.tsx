export default function ResultPage() {
  return (
    <div className="min-h-screen bg-indigo-900 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans text-center selection:bg-indigo-500">

      {/* Efek Kembang Api / Cahaya Latar */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-indigo-500/40 via-transparent to-transparent animate-pulse z-0"></div>

      <div className="relative z-10 w-full max-w-md">

        {/* Label Selebrasi */}
        <div className="text-6xl md:text-8xl mb-6 drop-shadow-2xl animate-bounce">
          🏆
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tight drop-shadow-md">
          Game Selesai!
        </h1>

        {/* KOTAK SKOR */}
        <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-2xl relative">

          <h2 className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-2">Total Score</h2>
          <h1 className="text-7xl font-black text-indigo-600 mb-6 drop-shadow-sm">80</h1>

          <div className="bg-indigo-50 border-2 border-indigo-100 rounded-2xl p-4 flex items-center justify-between mb-10">
            <span className="font-bold text-slate-600">Akurasi Jawaban</span>
            <span className="font-black text-green-500 text-xl">75%</span>
          </div>

          {/* Logic onClick button biarkan kamu yg isi nanti */}
          <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xl py-4 rounded-full shadow-[0_8px_20px_rgba(79,70,229,0.3)] hover:-translate-y-1 transition-all active:scale-95">
            Play Again
          </button>
        </div>

      </div>
    </div>
  )
}