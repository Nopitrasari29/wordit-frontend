type Props = {
    step: number
}

export default function GameCreatorWizard({ step }: Props) {

    const steps = [
        "Choose Level",
        "Choose Template",
        "Create Game",
        "Add Questions",
        "Preview"
    ]

    return (

        <div className="flex gap-3 mb-8 flex-wrap">

            {steps.map((s, i) => (

                <div
                    key={i}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${step === i
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-200 text-gray-700"
                        }`}
                >

                    {i + 1}. {s}

                </div>

            ))}

        </div>

    )

}