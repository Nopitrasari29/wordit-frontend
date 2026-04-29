import { useState } from "react";

type Props = {
    placeholder?: string;
    type?: string;
    value?: string;
    label?: string;
    error?: string;
    required?: boolean; 
    onChange?: (e: any) => void;
};

export default function Input({
    placeholder,
    type = "text",
    value,
    label,
    error,
    required, 
    onChange,
}: Props) {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordType = type === "password";

    return (
        <div className="w-full flex flex-col gap-2">
            {label && (
                <label className="text-sm font-bold text-slate-700 ml-2">
                    {label} {required && <span className="text-rose-500">*</span>}
                </label>
            )}

            <div className="relative">
                <input
                    type={isPasswordType ? (showPassword ? "text" : "password") : type}
                    placeholder={placeholder}
                    value={value}
                    required={required} 
                    onChange={onChange}
                    className="w-full bg-slate-50 text-slate-800 px-6 py-4 rounded-full border-2 border-slate-100 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all font-semibold placeholder:font-normal"
                />
                
                {isPasswordType && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                        {showPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                        )}
                    </button>
                )}
            </div>

            {error && (
                <p className="text-rose-500 font-bold text-xs mt-1 ml-2">
                    {error}
                </p>
            )}
        </div>
    );
}