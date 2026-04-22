import { useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import GameBuilderRouter from "../../../components/game/GameBuilderRouter";
// 🎯 Pastikan createGame sudah ada di service kamu
import { createGame } from "../../services/game.service"; 

export default function CreateGamePage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    // 🏷️ Ambil Template dan Level dari URL (misal: ?template=ANAGRAM&level=UNIVERSITY)
    const template = searchParams.get("template") || "ANAGRAM";
    const level = searchParams.get("level") || "SD";

    const [title, setTitle] = useState("");
    const [gameJson, setGameJson] = useState<any>(null); // Tempat menyimpan butir soal
    const [isSaving, setIsSaving] = useState(false);

    // 🔄 Menangkap perubahan soal dari Builder (Anagram, Hangman, dll)
    const handleEditorChange = useCallback((content: any) => {
        setGameJson(content);
    }, []);

    // 🚀 Fungsi untuk mengirim kuis baru ke Database Docker (Paten!)
    const handleSave = async () => {
        if (!title) return alert("Jangan lupa isi Judul Aktivitasnya ya, Nop! 😊");
        
        try {
            setIsSaving(true);
            const payload = {
                title,
                templateType: template as any,
                educationLevel: level as any,
                gameJson: gameJson
            };
            
            await createGame(payload);
            alert("Kuis berhasil dipublikasikan! 🎉");
            navigate("/teacher/projects");
        } catch (err: any) {
            console.error("Create Error:", err);
            alert("Gagal membuat kuis: " + (err.response?.data?.message || err.message));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-20 px-6 font-sans space-y-10">
            
            {/* 1. HEADER SECTION */}
            <div className="bg-indigo-600 rounded-[3rem] p-10 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <h1 className="text-4xl font-black tracking-tight relative z-10">Create New Game 🛠️</h1>
                <p className="opacity-80 font-bold mt-2 relative z-10">
                    Jenjang: <span className="bg-white/20 px-3 py-1 rounded-full">{level}</span> • 
                    Template: <span className="bg-white/20 px-3 py-1 rounded-full ml-1">{template}</span>
                </p>
            </div>

            {/* 2. TITLE INPUT SECTION */}
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 group">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6 mb-3 block">
                    Judul Aktivitas
                </label>
                <input 
                    type="text"
                    className="w-full bg-slate-50 border-2 border-transparent px-8 py-5 rounded-full focus:bg-white focus:border-indigo-500 outline-none font-black text-2xl text-slate-800 transition-all"
                    placeholder="Contoh: Kuis Web Programming II"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>

            {/* 3. BUILDER AREA (Anagram, Hangman, dll) */}
            <div className="bg-white rounded-[4rem] p-8 md:p-14 shadow-2xl border border-slate-100 min-h-[500px]">
                {/* 🎯 SEKARANG PROPS-NYA LENGKAP: Error TS Hilang! */}
                <GameBuilderRouter 
                    templateType={template as any}
                    value={gameJson}
                    onChange={handleEditorChange}
                />
            </div>

            {/* 4. FINAL ACTION BUTTON */}
            <div className="flex justify-end bg-slate-900 p-8 rounded-[3rem] shadow-2xl">
                <button 
                    className={`bg-indigo-600 text-white px-14 py-5 rounded-full font-black text-lg shadow-xl shadow-indigo-900/40 hover:bg-indigo-500 transition-all active:scale-95 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? "Menyimpan ke Database..." : "Publish Game 🚀"}
                </button>
            </div>
        </div>
    )
}