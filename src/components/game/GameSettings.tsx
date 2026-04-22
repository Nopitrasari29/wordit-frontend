// src/components/game/GameSettings.tsx

// 🎯 TAMBAHKAN INI: Mendefinisikan struktur Props
interface Props {
  settings: {
    timer: number;
    shuffle: boolean;
    attempts: number;
  };
  setSettings: (settings: any) => void;
}

export default function GameSettings({ settings, setSettings }: Props) {
    return (
        <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm font-sans">
            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                ⚙️ Game Settings
            </h3>

            <div className="space-y-6">
                {/* Timer Section */}
                <div>
                    <label className="block text-sm font-black text-slate-600 mb-2 ml-2">Timer per Soal (Detik)</label>
                    <input
                        type="number"
                        className="w-full bg-slate-50 border-2 border-slate-100 px-6 py-3 rounded-full focus:border-indigo-500 focus:bg-white outline-none font-bold transition-all"
                        value={settings.timer}
                        onChange={(e) => setSettings({ ...settings, timer: Number(e.target.value) })}
                    />
                </div>

                {/* Shuffle Section */}
                <label className="flex items-center gap-3 cursor-pointer group bg-slate-50 p-4 rounded-2xl border-2 border-transparent hover:border-indigo-100 transition-all">
                    <input
                        type="checkbox"
                        className="w-5 h-5 rounded-full border-2 border-slate-300 checked:bg-indigo-600 transition-all cursor-pointer"
                        checked={settings.shuffle}
                        onChange={(e) => setSettings({ ...settings, shuffle: e.target.checked })}
                    />
                    <span className="font-bold text-slate-700">Acak Urutan Pertanyaan</span>
                </label>

                {/* Attempts Section */}
                <div>
                    <label className="block text-sm font-black text-slate-600 mb-2 ml-2">Maksimal Kesempatan (Nyawa)</label>
                    <input
                        type="number"
                        className="w-full bg-slate-50 border-2 border-slate-100 px-6 py-3 rounded-full focus:border-indigo-500 focus:bg-white outline-none font-bold transition-all"
                        value={settings.attempts}
                        onChange={(e) => setSettings({ ...settings, attempts: Number(e.target.value) })}
                    />
                </div>
            </div>
        </div>
    )
}