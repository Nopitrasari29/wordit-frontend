import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error inside ErrorBoundary:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="w-full max-w-md mx-auto my-12 p-8 bg-rose-50 border-2 border-rose-100 rounded-3xl text-center shadow-lg animate-fade-in font-sans">
          <span className="text-5xl block mb-4 animate-bounce">🌵</span>
          <h2 className="text-lg font-black text-rose-700 uppercase tracking-tight">Game Mengalami Kendala</h2>
          <p className="text-xs text-rose-500 font-semibold mt-1.5 leading-relaxed">
            Terjadi kesalahan internal saat memproses permainan ini. Coba segarkan halaman atau muat ulang.
          </p>
          {this.state.error && (
            <div className="mt-4 p-3 bg-white border border-rose-100 rounded-2xl text-[10px] font-mono text-rose-600 text-left overflow-x-auto whitespace-pre-wrap max-h-24 shadow-inner">
              {this.state.error.toString()}
            </div>
          )}
          <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] uppercase tracking-widest px-6 py-3.5 rounded-full transition-all active:scale-98 shadow-md"
            >
              Reload Halaman 🔄
            </button>
            <button
              onClick={() => window.history.back()}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-black text-[10px] uppercase tracking-widest px-6 py-3.5 rounded-full transition-all active:scale-98"
            >
              Kembali ❮
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
