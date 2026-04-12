type Props = {
    placeholder?: string;
    type?: string;
    value?: string;
    label?: string;
    error?: string;
    onChange?: (e: any) => void;
};

export default function Input({
    placeholder,
    type = "text",
    value,
    label,
    error,
    onChange,
}: Props) {
    return (
        <div className="w-full">

            {label && (
                <label className="block mb-1 text-sm font-medium">
                    {label}
                </label>
            )}

            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {error && (
                <p className="text-red-500 text-xs mt-1">
                    {error}
                </p>
            )}

        </div>
    );
}