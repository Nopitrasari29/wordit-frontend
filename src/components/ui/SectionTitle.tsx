type Props = {
    title: string;
    subtitle?: string;
};

export default function SectionTitle({ title, subtitle }: Props) {
    return (
        <div className="text-center mb-14">

            <h2 className="text-4xl font-bold text-gray-800">
                {title}
            </h2>

            {subtitle && (
                <p className="text-gray-500 mt-2">
                    {subtitle}
                </p>
            )}

        </div>
    );
}