import { TemplateType } from "../../types/game"

export default function GameTemplateController({

    template,
    setTemplate

}: any) {

    const templates = [

        TemplateType.ANAGRAM,
        TemplateType.FLASHCARD,
        TemplateType.HANGMAN,
        TemplateType.MAZE_CHASE,
        TemplateType.SPIN_THE_WHEEL,
        TemplateType.WORD_SEARCH

    ]

    return (

        <div>

            <h2>Select Template</h2>

            {templates.map((t) => (

                <button

                    key={t}

                    onClick={() => setTemplate(t)}

                    style={{

                        margin: 10,
                        background: template === t ? "lightblue" : "white"

                    }}

                >

                    {t}

                </button>

            ))}

        </div>

    )

}