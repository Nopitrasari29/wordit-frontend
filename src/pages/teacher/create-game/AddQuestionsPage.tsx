import { useState, useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import { toast } from "react-hot-toast"
import GameCreatorWizard from "../../../components/game/GameCreatorWizard"
import AIQuizGenerator from "../../../components/ai/AIQuizGenerator"
import AnagramBuilder from "../../../components/game/builders/AnagramBuilder"

export default function AddQuestionsPage() {
    const [searchParams] = useSearchParams();
    const template = searchParams.get("template") || "ANAGRAM";
    const level = searchParams.get("level") || "SD";

    const [questions, setQuestions] = useState<any[]>([]);
    const [isAiMode, setIsAiMode] = useState(true);

    const handleAIFinish = useCallback((aiData: any[]) => {
        if (!aiData) return;
        setQuestions(aiData);
        setIsAiMode(false);
        toast.success("Soal AI Berhasil Dimuat! ✨");
    }, []);

    const handleBuilderChange = useCallback((data: any) => {
        if (data && data.words) {
            setQuestions(data.words);
        }
    }, []);

    return (
        // Gunakan h-auto dan remove overflow-hidden biar gak ketutup
        <div className="min-h-screen bg-slate-50 font-sans pb-40 pt-8 relative">
            <div className="max-w-4xl mx-auto px-4 relative z-10">

                {/* 1. STEPPER */}
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
                        {/* HEADER */}
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
                                ← Ganti Materi
                            </button>
                        </div>

                        {/* BUILDER UTAMA */}
                        <div className="relative">
                            <AnagramBuilder
                                initialData={questions}
                                onChange={handleBuilderChange}
                            />
                        </div>

                        {/* PUBLISH BUTTON */}
                        <div className="flex gap-4 pt-10">
                            <button
                                onClick={() => {
                                    if (questions.length > 0) {
                                        console.log("PUBLISH:", questions);
                                        toast.success("Game Berhasil Terbit! 🚀");
                                    } else {
                                        toast.error("Belum ada soal!");
                                    }
                                }}
                                className="w-full bg-indigo-600 py-6 rounded-full font-black text-white shadow-2xl hover:bg-indigo-500 transition-all cursor-pointer active:scale-95 text-xl"
                            >
                                PUBLIKASIKAN SEKARANG 🚀
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}