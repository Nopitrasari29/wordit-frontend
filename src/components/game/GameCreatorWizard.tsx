import { useState } from "react"

import GameTemplateController from "./GameTemplateController"
import GameBuilderRouter from "./GameBuilderRouter"

export default function GameCreatorWizard({

    onSubmit

}: any) {

    const [template, setTemplate] = useState<any>(null)

    const [gameJson, setGameJson] = useState<any>({})

    return (

        <div>

            <h2>Create Game</h2>

            <GameTemplateController

                template={template}
                setTemplate={setTemplate}

            />

            {template && (

                <GameBuilderRouter

                    templateType={template}
                    value={gameJson}
                    onChange={setGameJson}

                />

            )}

            <button

                onClick={() => {

                    onSubmit({

                        templateType: template,
                        gameJson

                    })

                }}

            >

                Save Game

            </button>

        </div>

    )

}