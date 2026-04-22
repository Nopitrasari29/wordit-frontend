type Props = {
    placeholder?: string;
    type?: string;
    value?: string;
    label?: string;
    error?: string;
    // ✅ FIX 1: Tambahkan properti required agar TypeScript tidak protes
    required?: boolean; 
    onChange?: (e: any) => void;
};

export default function Input({
    placeholder,
    type = "text",
    value,
    label,
    error,
    // ✅ FIX 2: Ambil props required di sini
    required, 
    onChange,
}: Props) {
    return (
        <div className="w-full flex flex-col gap-2">
            {label && (
                <label className="text-sm font-bold text-slate-700 ml-2">
                    {/* ✅ TIPS: Kasih tanda bintang merah kalau field-nya wajib diisi */}
                    {label} {required && <span className="text-rose-500">*</span>}
                </label>
            )}

            <input
                type={type}
                placeholder={placeholder}
                value={value}
                // ✅ FIX 3: Masukkan nilai required ke elemen input asli
                required={required} 
                onChange={onChange}
                className="w-full bg-slate-50 text-slate-800 px-6 py-4 rounded-full border-2 border-slate-100 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all font-semibold placeholder:font-normal"
            />

            {error && (
                <p className="text-rose-500 font-bold text-xs mt-1 ml-2">
                    {error}
                </p>
            )}
        </div>
    );
}