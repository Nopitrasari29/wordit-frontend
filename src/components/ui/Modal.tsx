import React from "react";
import Button from "./Button";

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    icon?: string;
    confirmText?: string;
    onConfirm?: () => void;
    isDanger?: boolean;
};

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    icon = "ℹ️",
    confirmText,
    onConfirm,
    isDanger = false
}: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-sans animate-fade-in">

            {/* Backdrop (Latar Belakang Gelap Kaca) */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            ></div>

            {/* Modal Box */}
            <div className="bg-white w-full max-w-md rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] relative z-10 overflow-hidden animate-fade-in-up">

                {/* Header Modal */}
                <div className={`pt-10 px-8 pb-6 flex flex-col items-center text-center ${isDanger ? 'bg-rose-50/50' : 'bg-indigo-50/50'}`}>
                    <div className="w-20 h-20 bg-white rounded-[1.5rem] flex items-center justify-center text-4xl shadow-md mb-5 rotate-3 hover:rotate-0 transition-transform duration-300">
                        {icon}
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-tight">
                        {title}
                    </h2>
                </div>

                {/* Body Modal */}
                <div className="px-10 py-8 text-center text-slate-600 font-bold text-lg leading-relaxed">
                    {children}
                </div>

                {/* Footer Modal (Tombol) */}
                <div className="p-8 pt-0 flex gap-4">
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        className="flex-1 !py-4 !rounded-2xl !bg-slate-100 !text-slate-500 hover:!bg-slate-200 shadow-none border-none"
                    >
                        Batal
                    </Button>

                    {onConfirm && confirmText && (
                        <Button
                            variant={isDanger ? "danger" : "primary"}
                            onClick={onConfirm}
                            className={`flex-1 !py-4 !rounded-2xl shadow-lg ${isDanger
                                    ? "!bg-rose-500 shadow-rose-200 hover:!bg-rose-600"
                                    : "!bg-indigo-600 shadow-indigo-200 hover:!bg-indigo-700"
                                }`}
                        >
                            {confirmText}
                        </Button>
                    )}
                </div>

                {/* Dekorasi Pojok */}
                <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-slate-50 rounded-full opacity-50"></div>
            </div>
        </div>
    );
}