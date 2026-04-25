import { useState, useCallback, useMemo } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import GameCreatorWizard from "../../../components/game/GameCreatorWizard"
import AIQuizGenerator from "../../../components/ai/AIQuizGenerator"

// 🛠️ BUILDER COMPONENTS
import AnagramBuilder from "../../../components/game/builders/AnagramBuilder"
import FlashcardBuilder from "../../../components/game/builders/FlashcardBuilder"
import HangmanBuilder from "../../../components/game/builders/HangmanBuilder"
import MazeChaseBuilder from "../../../components/game/builders/MazeChaseBuilder"
import SpinWheelBuilder from "../../../components/game/builders/SpinWheelBuilder"
import WordSearchBuilder from "../../../components/game/builders/WordSearchBuilder"

// 🚀 SERVICE & TYPES
import { createGame } from "../../services/game.service"
import { TemplateType, EducationLevel, DifficultyLevel } from "../../../types/game"

export default function AddQuestionsPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // 🔍 NORMALIZE TEMPLATE ID
    const rawTemplate = searchParams.get("template")?.toUpperCase() || "";
    const template = useMemo(() => {
        if (rawTemplate.includes("FLASHCARD")) return TemplateType.FLASHCARD;
        if (rawTemplate.includes("ANAGRAM")) return TemplateType.ANAGRAM;
        if (rawTemplate.includes("HANGMAN")) return TemplateType.HANGMAN;
        if (rawTemplate.includes("MAZE")) return TemplateType.MAZE_CHASE;
        if (rawTemplate.includes("SPIN")) return TemplateType.SPIN_THE_WHEEL;
        if (rawTemplate.includes("WORD")) return TemplateType.WORD_SEARCH;
        return TemplateType.ANAGRAM;
    }, [rawTemplate]);

    const level = (searchParams.get("level") as EducationLevel) || EducationLevel.SD;
    const title = searchParams.get("title") || "Untitled Game";

    // 🚩 Inisialisasi state dengan struktur default yang aman
    const [gameData, setGameData] = useState<any>({ cards: [], words: [], gridSize: 8 });
    const [isAiMode, setIsAiMode] = useState(true);
    const [isPublishing, setIsPublishing] = useState(false);

    const handleAIFinish = useCallback((aiResponse: any) => {
        if (!aiResponse) return;
        setGameData(aiResponse);
        setIsAiMode(false);
        toast.success("Soal AI Berhasil Dimuat! ✨");
    }, []);

    const handleBuilderChange = useCallback((updatedData: any) => {
        if (!updatedData) return;
        // Normalisasi: Jika builder mengirim array karena kesalahan logic sebelumnya, ambil item pertamanya
        const cleanData = Array.isArray(updatedData) ? updatedData[0] : updatedData;
        setGameData(cleanData);
    }, []);

    const renderBuilder = useMemo(() => {
        const props = {
            onChange: handleBuilderChange,
            value: gameData
        };

        switch (template) {
            case TemplateType.FLASHCARD: return <FlashcardBuilder {...props} />;
            case TemplateType.ANAGRAM: return <AnagramBuilder {...props} />;
            case TemplateType.HANGMAN: return <HangmanBuilder {...props} />;
            case TemplateType.MAZE_CHASE: return <MazeChaseBuilder {...props} />;
            case TemplateType.SPIN_THE_WHEEL: return <SpinWheelBuilder {...props} />;
            case TemplateType.WORD_SEARCH: return <WordSearchBuilder {...props} />;
            default: return (
                <div className="p-20 text-center border-4 border-dashed rounded-[3rem] bg-white">
                    <h2 className="text-2xl font-black text-slate-400 uppercase">Template Not Recognized</h2>
                </div>
            );
        }
    }, [template, gameData, handleBuilderChange]);

    const handleSaveGame = async (isPublished: boolean) => {
        // Ambil data items (bisa berupa 'words' atau 'cards')
        const items = gameData.words || gameData.cards || [];
        if (items.length === 0) return toast.error("Minimal harus ada 1 soal!");

        setIsPublishing(true);
        try {
            // 🚀 1. TRANSFORMASI DATA SESUAI SPRINT 2 & SCHEMA BACKEND
            let content: any = {
                template: template
            };

            if (template === TemplateType.FLASHCARD) {
                content.cards = items.map((item: any) => ({
                    front: String(item.front || item.word || "").trim(),
                    back: String(item.back || item.hint || "").trim()
                })).filter((c: any) => c.front !== "");
            } else {
                // Untuk WORD_SEARCH, HANGMAN, ANAGRAM (Mewajibkan field 'word' dan 'hint')
                content.words = items.map((item: any) => ({
                    word: String(item.word || item.front || "").toUpperCase().replace(/[^A-Z]/g, ""),
                    // Hint wajib (min 1) sesuai Zod Schema Backend
                    hint: String(item.hint || item.back || "Cari kata ini").trim()
                })).filter((w: any) => w.word !== "");

                // Khusus Word Search, sertakan gridSize
                if (template === TemplateType.WORD_SEARCH) {
                    content.gridSize = Number(gameData.gridSize || 8);
                }
            }

            // 📦 2. PAYLOAD FINAL (Wajib dibungkus Array [] untuk menghindari error 400)
            const payload = {
                title: title.trim(),
                templateType: template,
                educationLevel: level,
                difficulty: DifficultyLevel.MEDIUM,
                isPublished: isPublished,
                // Menggunakan 'as any' karena interface Game di types/game.ts mungkin masih mengharapkan Object
                gameJson: [content] as any
            };

            console.log("📤 MENGIRIM PAYLOAD KE BACKEND:", payload);

            await createGame(payload);

            toast.success(isPublished ? "Game Berhasil Terbit! 🚀" : "Draft Disimpan! 📝");
            navigate("/teacher/dashboard");
        } catch (error: any) {
            console.error("❌ BACKEND ERROR:", error.response?.data);
            // Ambil pesan error spesifik dari Zod jika ada
            const detail = error.response?.data?.errors?.gameJson?.[0] ||
                error.response?.data?.message ||
                "Gagal menyimpan. Cek format data.";
            toast.error(`Gagal: ${detail}`);
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-40 pt-8 relative">
            <div className="max-w-4xl mx-auto px-4">
                {/* Step Wizard */}
                <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 mb-8">
                    <GameCreatorWizard step={3} />
                </div>

                {isAiMode ? (
                    <AIQuizGenerator
                        level={level}
                        template={template}
                        onFinish={handleAIFinish}
                    />
                ) : (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        {/* Editor Header */}
                        <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                            <div>
                                <h1 className="text-3xl font-black text-slate-800 italic uppercase">
                                    {template.replace("_", " ")} Editor
                                </h1>
                                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">
                                    {title} • JENJANG {level}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsAiMode(true)}
                                className="bg-indigo-50 text-indigo-600 px-6 py-3 rounded-full font-black text-xs hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                            >
                                ✨ Generate Ulang
                            </button>
                        </div>

                        {/* Builder Component */}
                        <div className="min-h-[300px]">
                            {renderBuilder}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col md:flex-row gap-4 pt-10">
                            <button
                                onClick={() => handleSaveGame(false)}
                                disabled={isPublishing}
                                className="flex-1 bg-white border-2 border-slate-200 py-6 rounded-full font-black text-slate-600 hover:bg-slate-50 transition-all text-xl shadow-sm disabled:opacity-50"
                            >
                                SIMPAN DRAFT 📝
                            </button>

                            <button
                                onClick={() => handleSaveGame(true)}
                                disabled={isPublishing}
                                className="flex-[2] bg-indigo-600 py-6 px-12 rounded-full font-black text-white shadow-2xl hover:bg-indigo-500 transition-all text-xl disabled:opacity-50"
                            >
                                {isPublishing ? "PROSES..." : "PUBLIKASIKAN 🚀"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}