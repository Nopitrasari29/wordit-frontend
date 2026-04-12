type Props = {
    name: string;
    icon?: string;
};

export default function TemplatePreview({ name, icon = "🎮" }: Props) {
    return (
        <div className="bg-white rounded-xl shadow-md p-10 text-center hover:shadow-xl hover:-translate-y-1 transition">

            <div className="text-4xl mb-4">
                {icon}
            </div>

            <h3 className="text-lg font-semibold">
                {name}
            </h3>

        </div>
    );
}