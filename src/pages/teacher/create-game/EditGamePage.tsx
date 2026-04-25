import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GameBuilderRouter from "../../../components/game/GameBuilderRouter";
import { getGameById, updateGame } from "../../services/game.service";
import { toast } from "react-hot-toast";

export default function GameEditPage() {
    const { gameId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [gamePayload, setGamePayload] = useState<any>(null);
    const [errorInfo, setErrorInfo] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // 🔄 Fungsi penangkap perubahan kuis (Dipanggil oleh semua Builder)
    const handleEditorChange = useCallback((content: any) => {
        setGamePayload((prev: any) => {
            if (!prev) return prev;

            // 🔥 SYNC: Gabungkan konten baru ke dalam gameJson
            // Memastikan key 'template' tetap ada untuk validasi backend
            return {
                ...prev,
                gameJson: {
                    ...prev.gameJson,
                    ...content,
                    template: prev.templateType
                }
            };
        });
    }, []);

    // 📡 Fetch Data Kuis dari Database
    useEffect(() => {
        const fetchGame = async () => {
            if (!gameId) return;
            try {
                setLoading(true);
                const data = await getGameById(gameId);

                console.log("🔥 DATA DARI DATABASE:", data);

                // 🎯 INISIALISASI CERDAS: Menyesuaikan field berdasarkan tipe kuis jika gameJson kosong
                let initialJson = data.gameJson || {};

                if (Object.keys(initialJson).length <= 1) { // Hanya ada key 'template' atau kosong
                    initialJson.template = data.templateType;

                    const type = data.templateType.toUpperCase();
                    if (['ANAGRAM', 'HANGMAN', 'WORD_SEARCH'].includes(type)) {
                        initialJson.words = initialJson.words || [];
                    } else if (type === 'FLASHCARD' || type === 'FLASHCARDS') {
                        initialJson.cards = initialJson.cards || [];
                    } else if (['SPIN_THE_WHEEL', 'MAZE_CHASE'].includes(type)) {
                        initialJson.questions = initialJson.questions || [];
                    }
                }

                setGamePayload({ ...data, gameJson: initialJson });
                setErrorInfo(null);
            } catch (err: any) {
                console.error("Fetch Error:", err);
                setErrorInfo(err.message || "Gagal memuat kuis.");
            } finally {
                setLoading(false);
            }
        };
        fetchGame();
    }, [gameId]);

    // 💾 Fungsi Simpan (Update) ke Database
    const handleSave = async () => {
        if (!gameId || !gamePayload) return;

        if (!gamePayload.title.trim()) {
            return toast.error("Judul kuis tidak boleh kosong!");
        }

        try {
            setIsSaving(true);

            // Payload bersih untuk dikirim ke API
            const updateData = {
                title: gamePayload.title,
                gameJson: gamePayload.gameJson
            };

            console.log("💾 MENGIRIM UPDATE:", updateData);
            await updateGame(gameId, updateData);

            toast.success("Kuis berhasil diperbarui! ✨");
            navigate("/teacher/dashboard"); // Kembali ke dashboard setelah sukses
        } catch (err: any) {
            console.error("Update Error:", err);
            const msg = err.response?.data?.message || "Gagal menyimpan perubahan.";
            toast.error(msg);
        } finally {
            setIsSaving(false);
        }
    };

    // --- RENDER STATES ---

    if (loading) return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 font-sans">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 font-black text-slate-400 uppercase text-[10px] tracking-widest animate-pulse">Menyiapkan Editor...</p>
        </div>
    );

    if (errorInfo) return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-rose-50 text-center p-6">
            <div className="text-6xl mb-4">🌵</div>
            <h1 className="text-rose-600 font-black text-2xl mb-2 uppercase tracking-tighter">⚠️ Gagal Memuat</h1>
            <p className="text-rose-400 font-bold mb-6">{errorInfo}</p>
            <button onClick={() => navigate("/teacher/dashboard")} className="bg-rose-600 text-white px-10 py-4 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg">
                Kembali ke Dashboard
            </button>
        </div>
    );

    return (
        <div className="min-h-screen w-full bg-slate-50 pt-32 pb-32 font-sans relative overflow-x-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-50/50 to-transparent -z-0"></div>

            <div className="max-w-[1000px] mx-auto px-6 space-y-10 relative z-10">
                {/* 1. EDIT JUDUL */}
                <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6 mb-3 block">Judul Aktivitas</label>
                    <input
                        type="text"
                        className="w-full bg-slate-50 border-2 border-transparent px-8 py-5 rounded-full focus:bg-white focus:border-indigo-500 outline-none font-black text-2xl text-slate-800 transition-all relative z-10 shadow-inner"
                        value={gamePayload?.title || ""}
                        onChange={(e) => setGamePayload({ ...gamePayload, title: e.target.value })}
                        placeholder="Masukkan judul kuis..."
                    />
                </div>

                {/* 2. BUILDER AREA (FlashcardBuilder akan menerima props 'value') */}
                <div className="bg-white rounded-[4rem] p-8 md:p-14 shadow-2xl border border-slate-100 min-h-[500px] relative">
                    <div className="mb-8 flex justify-between items-center">
                        <h2 className="text-xl font-black text-slate-800 italic uppercase tracking-tighter">
                            {gamePayload?.templateType.replace("_", " ")} Editor
                        </h2>
                        <span className="bg-indigo-600 text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-lg shadow-indigo-200">
                            Mode Edit 🛠️
                        </span>
                    </div>

                    <GameBuilderRouter
                        templateType={gamePayload?.templateType}
                        value={gamePayload?.gameJson} // 👈 Akan ditangkap FlashcardBuilder sebagai 'value'
                        onChange={handleEditorChange}
                    />
                </div>

                {/* 3. SAVE BUTTON SECTION */}
                <div className="flex justify-between items-center bg-slate-900 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                    <button
                        onClick={() => navigate(-1)}
                        className="relative z-10 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-white transition-colors"
                    >
                        ← Batal & Kembali
                    </button>

                    <button
                        className={`relative z-10 bg-indigo-600 text-white px-14 py-5 rounded-full font-black text-lg shadow-xl shadow-indigo-900/40 hover:bg-indigo-500 transition-all active:scale-95 flex items-center gap-3 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Menyimpan...</span>
                            </>
                        ) : (
                            <>Simpan Perubahan ✅</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}