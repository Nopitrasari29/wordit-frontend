import Button from "./Button";

type ConfirmModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
};

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] max-w-md w-full p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <h3 className="text-xl font-black text-slate-800 mb-2">{title}</h3>
        <p className="text-slate-505 font-semibold text-sm mb-6 leading-relaxed text-slate-500">
          {message}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 rounded-full border-2 border-slate-100 hover:bg-slate-50 font-bold text-slate-600 text-sm transition-all active:scale-95 cursor-pointer"
          >
            {cancelText}
          </button>
          <Button
            type="button"
            onClick={onConfirm}
            className="shadow-lg shadow-indigo-100"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
