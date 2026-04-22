import { useState, useCallback, useMemo } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import GameCreatorWizard from "../../../components/game/GameCreatorWizard"
import AIQuizGenerator from "../../../components/ai/AIQuizGenerator"

// 🛠️ IMPORT SEMUA BUILDER
import AnagramBuilder from "../../../components/game/builders/AnagramBuilder"
import FlashcardBuilder from "../../../components/game/builders/FlashcardBuilder"
import HangmanBuilder from "../../../components/game/builders/HangmanBuilder"
import MazeChaseBuilder from "../../../components/game/builders/MazeChaseBuilder"
import SpinWheelBuilder from "../../../components/game/builders/SpinWheelBuilder"
import WordSearchBuilder from "../../../components/game/builders/WordSearchBuilder"

// 🚀 IMPORT TYPES & SERVICE
import { createGame } from "../../services/game.service"
import { TemplateType, EducationLevel, DifficultyLevel, Game } from "../../../types/game"

export default function AddQuestionsPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const template = (searchParams.get("template") as TemplateType) || TemplateType.ANAGRAM;
    const level = (searchParams.get("level") as EducationLevel) || EducationLevel.SD;
    const title = searchParams.get("title") || "Untitled Game";

    const [questions, setQuestions] = useState<any[]>([]);
    const [isAiMode, setIsAiMode] = useState(true);
    const [isPublishing, setIsPublishing] = useState(false);

    const handleAIFinish = useCallback((aiData: any[]) => {
        if (!aiData) return;
        setQuestions(aiData);
        setIsAiMode(false);
        toast.success("Soal AI Berhasil Dimuat! ✨");
    }, []);

    const handleBuilderChange = useCallback((data: any) => {
        if (!data) return;
        const updatedItems = data.words || data.cards || data.questions || [];
        setQuestions(updatedItems);
    }, []);

    const renderBuilder = useMemo(() => {
        const props = { initialData: questions, onChange: handleBuilderChange };
        
        switch (template) {
            case TemplateType.ANAGRAM: return <AnagramBuilder {...props} />;
            case TemplateType.FLASHCARD: return <FlashcardBuilder {...props} />;
            case TemplateType.HANGMAN: return <HangmanBuilder {...props} />;
            case TemplateType.MAZE_CHASE: return <MazeChaseBuilder {...props} />;
            case TemplateType.SPIN_THE_WHEEL: return <SpinWheelBuilder {...props} />;
            case TemplateType.WORD_SEARCH: return <WordSearchBuilder {...props} />;
            default: return <AnagramBuilder {...props} />;
        }
    }, [template, questions, handleBuilderChange]);

    // 🚀 FUNGSI PUBLISH & DRAFT (FIXED)
    const handleSaveGame = async (isPublished: boolean) => {
        if (questions.length === 0) return toast.error("Minimal harus ada 1 soal ya!");
        
        setIsPublishing(true);
        try {
            // ✅ PAYLOAD LENGKAP: Menambahkan difficulty dan isPublished
            const payload: Partial<Game> = {
                title,
                templateType: template,
                educationLevel: level,
                difficulty: DifficultyLevel.MEDIUM, // 👈 Tambahkan default difficulty
                isPublished: isPublished,          // 👈 Tentukan status publish/draft
                gameJson: {
                    template: template,
                    ...(template === TemplateType.FLASHCARD 
                        ? { cards: questions } 
                        : [TemplateType.MAZE_CHASE, TemplateType.SPIN_THE_WHEEL].includes(template) 
                            ? { questions: questions } 
                            : { words: questions })
                }
            };

            await createGame(payload);
            
            toast.success(isPublished ? "Game Berhasil Terbit! 🚀" : "Game Disimpan sebagai Draft! 📝");
            navigate("/teacher/dashboard");
        } catch (error: any) {
            // 🔍 Debugging: Menangkap pesan error spesifik dari Backend
            const errorMsg = error.response?.data?.message || "Gagal menyimpan game.";
            toast.error(errorMsg);
            console.error("Detail Error:", error.response?.data);
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-40 pt-8 relative">
            <div className="max-w-4xl mx-auto px-4 relative z-10">
                <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 mb-8">
                    <GameCreatorWizard step={3} />
                </div>

                {isAiMode ? (
                    <div className="relative z-20">
                        <AIQuizGenerator
                            level={level}
                            template={template}
                            onFinish={handleAIFinish}
                        />
                    </div>
                ) : (
                    <div className="space-y-8 relative z-30">
                        <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                            <div>
                                <h1 className="text-3xl font-black text-slate-800 italic">Game Builder</h1>
                                <p className="text-slate-400 font-bold text-xs uppercase mt-1">
                                    {template} • LEVEL {level}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsAiMode(true)}
                                className="bg-indigo-50 text-indigo-600 px-6 py-3 rounded-full font-black text-xs hover:bg-indigo-600 hover:text-white transition-all cursor-pointer"
                            >
                                ✨ Generate Ulang
                            </button>
                        </div>

                        <div className="relative">
                            {renderBuilder}
                        </div>

                        {/* ✅ TOMBOL AKSI: Draft & Publish */}
                        <div className="flex flex-col md:flex-row gap-4 pt-10">
                            <button
                                onClick={() => handleSaveGame(false)} // Simpan sebagai Draft
                                disabled={isPublishing}
                                className="flex-1 bg-white border-2 border-slate-200 py-6 rounded-full font-black text-slate-600 hover:bg-slate-50 transition-all cursor-pointer disabled:opacity-50 text-xl"
                            >
                                SIMPAN DRAFT 📝
                            </button>
                            
                            <button
                                onClick={() => handleSaveGame(true)} // Publikasikan
                                disabled={isPublishing}
                                className="flex-2 bg-indigo-600 py-6 px-12 rounded-full font-black text-white shadow-2xl hover:bg-indigo-500 transition-all cursor-pointer active:scale-95 text-xl disabled:opacity-50"
                            >
                                {isPublishing ? "PROSES..." : "PUBLIKASIKAN SEKARANG 🚀"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}