import { useState } from "react"
import GameTemplateController from "./GameTemplateController"
import GameBuilderRouter from "./GameBuilderRouter"

export default function GameCreatorWizard({
    onSubmit
}: any) {
    const [template, setTemplate] = useState<any>(null)
    const [gameJson, setGameJson] = useState<any>({})

    return (
        <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-xl border border-slate-100 font-sans relative overflow-hidden">

            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <h2 className="text-3xl font-black text-slate-800 mb-8 relative z-10 tracking-tight">
                Create Game 🚀
            </h2>

            <div className="relative z-10 space-y-8">
                <GameTemplateController
                    template={template}
                    setTemplate={setTemplate}
                />

                {template && (
                    <div className="bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100 border-dashed">
                        <GameBuilderRouter
                            templateType={template}
                            value={gameJson}
                            onChange={setGameJson}
                        />
                    </div>
                )}

                <div className="pt-6 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={() => {
                            onSubmit({
                                templateType: template,
                                gameJson
                            })
                        }}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-lg px-10 py-4 rounded-full shadow-[0_8px_20px_rgba(79,70,229,0.3)] hover:-translate-y-1 transition-all active:scale-95"
                    >
                        Save Game
                    </button>
                </div>
            </div>

        </div>
    )
}