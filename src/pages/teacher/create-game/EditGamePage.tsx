import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GameBuilderRouter from "../../../components/game/GameBuilderRouter";

export default function GameEditPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [gamePayload, setGamePayload] = useState<any>(null);
    const [errorInfo, setErrorInfo] = useState<string | null>(null);

    // Gunakan useCallback agar fungsi tidak dibuat ulang setiap render (mencegah loop)
    const handleEditorChange = useCallback((content: any) => {
        setGamePayload((prev: any) => {
            // Hanya update jika konten benar-benar berubah
            if (JSON.stringify(prev?.gameJson) === JSON.stringify(content)) {
                return prev;
            }
            return { ...prev, gameJson: content };
        });
    }, []);

    useEffect(() => {
        const fetchGame = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`http://localhost:3000/api/games/${id}`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                const res = await response.json();
                console.log("LOG SERVER:", res);

                if (res.status === 'success' || res.success) {
                    setGamePayload(res.data);
                    setLoading(false);
                } else {
                    setErrorInfo(res.message || "Data tidak ditemukan");
                    setLoading(false);
                }
            } catch (err) {
                console.error("Fetch Error:", err);
                setErrorInfo("Gagal terhubung ke Backend.");
                setLoading(false);
            }
        };

        if (id) fetchGame();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 font-sans">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 font-black text-slate-400 uppercase text-[10px] tracking-widest animate-pulse">
                    Menyiapkan Editor...
                </p>
            </div>
        );
    }

    if (errorInfo) {
        return (
            <div className="min-h-screen w-full flex flex-col items-center justify-center bg-rose-50 text-center p-6">
                <h1 className="text-rose-600 font-black text-2xl mb-2 uppercase tracking-tighter">⚠️ Gagal Memuat</h1>
                <p className="text-rose-400 font-bold mb-6">{errorInfo}</p>
                <button
                    onClick={() => navigate("/teacher/projects")}
                    className="bg-rose-600 text-white px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest"
                >
                    Kembali ke Projects
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-slate-50 pt-32 pb-32">
            <div className="max-w-[1200px] mx-auto px-6 space-y-10 animate-fade-in-up">

                {/* EDIT JUDUL */}
                <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6 mb-3 block relative z-10">
                        Judul Aktivitas
                    </label>
                    <input
                        type="text"
                        className="w-full bg-slate-50 border-2 border-transparent px-8 py-5 rounded-full focus:bg-white focus:border-indigo-500 outline-none font-black text-2xl text-slate-800 transition-all relative z-10"
                        value={gamePayload?.title || ""}
                        onChange={(e) => setGamePayload({ ...gamePayload, title: e.target.value })}
                    />
                </div>

                {/* BUILDER AREA */}
                <div className="bg-white rounded-[4rem] p-8 md:p-14 shadow-2xl border border-slate-100 min-h-[500px]">
                    <GameBuilderRouter
                        templateType={gamePayload?.templateType}
                        value={gamePayload?.gameJson}
                        onChange={handleEditorChange}
                    />
                </div>

                {/* SAVE BUTTON */}
                <div className="flex justify-end bg-slate-900 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <button
                        className="relative z-10 bg-indigo-600 text-white px-14 py-5 rounded-full font-black text-lg shadow-xl shadow-indigo-900/40 hover:bg-indigo-500 transition-all active:scale-95"
                        onClick={() => console.log("Update Data:", gamePayload)}
                    >
                        Simpan Perubahan ✅
                    </button>
                </div>
            </div>
        </div>
    );
}