export default function Loader({ text }: { text?: string }) {
    return (
        <div className="flex flex-col justify-center items-center py-20 gap-4 font-sans text-center">
            <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-8 border-indigo-100 rounded-full"></div>
                <div className="absolute inset-0 border-8 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            {text && <p className="text-indigo-600 font-black animate-pulse">{text}</p>}
        </div>
    );
}