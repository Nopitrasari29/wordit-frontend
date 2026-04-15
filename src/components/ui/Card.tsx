import React from "react";

type Props = {
    children: React.ReactNode;
    className?: string;
};

export default function Card({ children, className = "" }: Props) {
    return (
        <div className={`bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 ${className}`}>
            {children}
        </div>
    );
}