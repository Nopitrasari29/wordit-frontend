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
            className={`px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 ${className}`}
        >
            {children}
        </button>
    );
}