import Wave from "./Wave"

type Props = {
    title: string
    color: string
    children: React.ReactNode
}

export default function PageWrapper({ title, color, children }: Props) {

    return (

        <div className="page-enter">

            {/* HEADER */}
            <div
                className="rounded-xl p-10 text-white shadow-lg mb-4"
                style={{
                    background: `linear-gradient(135deg, ${color}, #2563eb)`
                }}
            >
                <h1 className="text-4xl font-bold">
                    {title}
                </h1>
            </div>

            {/* WAVE */}
            <Wave color="#F1F5F9" />

            {/* CONTENT */}
            <div className="mt-6">

                {children}

            </div>

        </div>

    )

}