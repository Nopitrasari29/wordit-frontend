import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GameBuilderRouter from "../../../components/game/GameBuilderRouter";
import { getGameById, updateGame } from "../../services/game.service";
import { toast } from "react-hot-toast";

export default function GameEditPage() {
    const { gameId } = useParams<{ gameId: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [gamePayload, setGamePayload] = useState<any>(null);
    const [errorInfo, setErrorInfo] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleEditorChange = useCallback((content: any) => {
        setGamePayload((prev: any) => {
            if (!prev) return prev;
            const dataObj = Array.isArray(content) ? content[0] : content;
            return {
                ...prev,
                gameJson: {
                    ...prev.gameJson,
                    ...dataObj,
                    template: prev.templateType
                }
            };
        });
    }, []);

    useEffect(() => {
        const fetchGame = async () => {
            if (!gameId) return;
            try {
                setLoading(true);
                // getGameById sekarang sudah membawa token secara otomatis via api.ts
                const data = await getGameById(gameId) as any;

                console.log("🔥 DATA BERHASIL DI-LOAD:", data);

                let initialJson = data.gameJson || {};
                initialJson.template = data.templateType;

                const type = data.templateType.toUpperCase();
                if (['ANAGRAM', 'HANGMAN', 'WORD_SEARCH'].includes(type)) {
                    initialJson.words = initialJson.words || [];
                } else if (type.includes('FLASHCARD')) {
                    initialJson.cards = initialJson.cards || [];
                } else if (['SPIN_THE_WHEEL', 'MAZE_CHASE', 'MULTIPLE_CHOICE', 'TRUE_FALSE', 'ESSAY'].includes(type)) {
                    initialJson.questions = initialJson.questions || [];
                } else if (type === 'MATCHING') {
                    initialJson.pairs = initialJson.pairs || [];
                }

                setGamePayload({ ...data, gameJson: initialJson });
                setErrorInfo(null);
            } catch (err: any) {
                console.error("Fetch Error:", err);
                const msg = err.response?.data?.message || "Game ini belum dipublikasikan atau Anda bukan pemiliknya.";
                setErrorInfo(msg);
            } finally {
                setLoading(false);
            }
        };
        fetchGame();
    }, [gameId]);

    const handleSave = async () => {
        if (!gameId || !gamePayload) return;
        if (!gamePayload.title.trim()) return toast.error("Judul wajib diisi!");

        setIsSaving(true);
        try {
            const content = { ...gamePayload.gameJson };

            // Sanitisasi data agar sesuai dengan Zod schema backend
            if (content.words) {
                content.words = content.words.map((w: any) => ({
                    word: String(w.word || w.front || "").toUpperCase().replace(/[^A-Z]/g, ""),
                    hint: String(w.hint || w.back || "Petunjuk").trim()
                })).filter((w: any) => w.word !== "");
            }

            if (content.questions) {
                content.questions = content.questions.map((q: any) => ({
                    question: String(q.question || q.hint || "").trim(),
                    answer: String(q.answer || q.word || q.correctAnswer || "").trim()
                })).filter((q: any) => q.answer !== "");
            }

            const updateData = {
                title: gamePayload.title.trim(),
                gameJson: content
            };

            await updateGame(gameId, updateData);
            toast.success("Revisi Berhasil Disimpan! ✨");
            navigate("/teacher/projects");
        } catch (err: any) {
            console.error("Update Error:", err);
            toast.error(err.response?.data?.message || "Gagal menyimpan perubahan.");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 font-black text-slate-400 text-[10px] tracking-widest uppercase">Menyiapkan Editor...</p>
        </div>
    );

    if (errorInfo) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-rose-50 p-6 text-center font-sans">
            <div className="text-6xl mb-4">🌵</div>
            <h1 className="text-rose-600 font-black text-2xl uppercase">Gagal Memuat</h1>
            <p className="text-rose-400 font-bold mb-8 italic">"{errorInfo}"</p>
            <button onClick={() => navigate("/teacher/projects")} className="bg-rose-600 text-white px-10 py-4 rounded-full font-black text-[10px] uppercase shadow-lg hover:bg-rose-700 transition-colors">Kembali ke Proyek</button>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 pt-32 pb-32 font-sans px-6">
            <div className="max-w-[1000px] mx-auto space-y-10">
                <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6 mb-3 block">Judul Aktivitas</label>
                    <input
                        type="text"
                        className="w-full bg-slate-50 border-2 border-transparent px-8 py-5 rounded-full focus:bg-white focus:border-indigo-500 outline-none font-black text-2xl text-slate-800 transition-all shadow-inner"
                        value={gamePayload?.title || ""}
                        onChange={(e) => setGamePayload({ ...gamePayload, title: e.target.value })}
                    />
                </div>

                <div className="bg-white rounded-[4rem] p-8 md:p-14 shadow-2xl border border-slate-100 min-h-[500px] relative">
                    <div className="mb-10 flex justify-between items-center px-4">
                        <h2 className="text-2xl font-black text-slate-800 italic uppercase tracking-tighter">
                            {gamePayload?.templateType?.replace("_", " ")} Editor
                        </h2>
                        <span className="bg-indigo-600 text-white text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-widest animate-pulse">REVISI 🛠️</span>
                    </div>
                    <GameBuilderRouter
                        templateType={gamePayload?.templateType}
                        value={gamePayload?.gameJson}
                        onChange={handleEditorChange}
                    />
                </div>

                <div className="sticky bottom-8 z-50 flex justify-between items-center bg-slate-900 p-8 rounded-[3rem] shadow-2xl">
                    <button onClick={() => navigate(-1)} className="text-slate-400 font-black text-[10px] uppercase hover:text-white ml-4 transition-colors">← Batal</button>
                    <button
                        className={`bg-indigo-600 text-white px-14 py-5 rounded-full font-black text-lg shadow-xl hover:bg-indigo-500 transition-all active:scale-95 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? "MENYIMPAN..." : "SIMPAN PERUBAHAN ✅"}
                    </button>
                </div>
            </div>
        </div>
    );
}