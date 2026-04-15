import React from "react";

type Props = {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
};

export default function Button({
    children,
    onClick,
    className = "",
    type = "button",
    disabled = false,
}: Props) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`px-8 py-3.5 rounded-full font-black text-lg bg-indigo-600 text-white shadow-[0_8px_20px_rgba(79,70,229,0.3)] hover:-translate-y-1 hover:shadow-lg hover:bg-indigo-500 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:hover:translate-y-0 ${className}`}
        >
            {children}
        </button>
    );
}