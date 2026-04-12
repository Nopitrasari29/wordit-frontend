type Props = {
    title: string;
    desc: string;
    icon?: string;
};

export default function FeatureCard({ title, desc, icon = "⭐" }: Props) {
    return (
        <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition">

            <div className="text-3xl mb-4">
                {icon}
            </div>

            <h3 className="font-semibold text-lg mb-2">
                {title}
            </h3>

            <p className="text-gray-600 text-sm">
                {desc}
            </p>

        </div>
    );
}