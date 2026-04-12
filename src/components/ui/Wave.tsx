export default function Wave({ color }: { color: string }) {

    return (

        <div className="w-full overflow-hidden leading-none">

            <svg
                viewBox="0 0 1440 120"
                className="w-full h-24"
                preserveAspectRatio="none"
            >

                <path
                    fill={color}
                    d="M0,96L120,80C240,64,480,32,720,32C960,32,1200,64,1320,80L1440,96L1440,160L0,160Z"
                />

            </svg>

        </div>

    )

}