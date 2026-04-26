import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "react-hot-toast"

export default function EnterPlayerPage() {
    const [name, setName] = useState("")
    const [params] = useSearchParams()
    const navigate = useNavigate()

    // 🎯 Mengambil kode kuis dari URL parameter (?code=...)
    const code = params.get("code") || ""

    function handleEnter(e: React.FormEvent) {
        e.preventDefault()

        const trimmedName = name.trim();

        // 1. Validasi Kosong
        if (!trimmedName) {
            return toast.error("Namanya jangan kosong, ya! 🌵")
        }

        // 2. 🎯 VALIDASI FORMAT (Regex): Harus ada "Underscore" di tengah
        // Format: [Kelas]_[Nama]
        // Penjelasan Regex: ^[a-zA-Z0-9]+ = Awalan huruf/angka, _ = harus ada underscore, .+ = diikuti minimal 1 karakter nama
        const formatRegex = /^[a-zA-Z0-9]+_.+/;

        if (!formatRegex.test(trimmedName)) {
            return toast.error("Format nama salah! Gunakan: Kelas_Nama (Contoh: 3A_Budi)", {
                duration: 4000,
                icon: "⚠️"
            });
        }

        // 3. Validasi Panjang Nama
        if (trimmedName.length < 5) {
            return toast.error("Identitas terlalu pendek, berikan nama yang jelas.")
        }

        // 🛠️ SINKRONISASI SESSION
        sessionStorage.removeItem("lastScore");
        sessionStorage.removeItem("lastAccuracy");
        sessionStorage.removeItem("lastBreakdown");

        sessionStorage.setItem("playerName", trimmedName)
        sessionStorage.setItem("gameCode", code)

        toast.success(`Selamat datang, ${trimmedName.split('_')[1]}! 🚀`);

        // 🚀 Navigasi ke Lobby
        navigate(`/student/game/lobby/${code}`)
    }

    return (
        <div className="min-h-screen bg-indigo-600 flex flex-col items-center justify-center p-6 font-sans overflow-hidden relative">

            {/* Background Decor */}
            <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl -top-20 -left-20 animate-pulse"></div>
            <div className="absolute w-64 h-64 bg-blue-400/20 rounded-full blur-2xl bottom-10 right-10"></div>

            <form
                onSubmit={handleEnter}
                className="bg-white p-10 md:p-14 rounded-[3.5rem] shadow-2xl w-full max-w-md relative z-10 text-center border-[10px] border-white/20"
            >
                <div className="mb-8">
                    <div className="text-5xl mb-4">🎮</div>
                    <h1 className="text-3xl font-black text-slate-800 mb-2 italic tracking-tighter">Siapa Namamu?</h1>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
                        Memasuki Arena: <span className="text-indigo-600 font-mono">{code || "UNKNOWN"}</span>
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2 text-left">
                        <label className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] ml-2">
                            Identitas Siswa (Wajib Format)
                        </label>
                        <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            // 🎯 FE-NEW-04: Placeholder sesuai format baru
                            placeholder="Contoh: 3A_Nayla"
                            className="w-full bg-slate-50 border-4 border-slate-100 focus:border-indigo-500 focus:bg-white p-6 rounded-3xl text-center text-xl font-black outline-none transition-all text-slate-700 placeholder:text-slate-300 placeholder:font-bold uppercase"
                            required
                            autoFocus
                        />
                        {/* 🎯 HINT PANDUAN */}
                        <div className="bg-amber-50 border border-amber-100 p-3 rounded-2xl mt-4">
                            <p className="text-[10px] text-amber-700 text-center font-bold leading-relaxed">
                                ⚠️ WAJIB: Gunakan underscore (_) untuk memisahkan kelas dan nama. <br />
                                <span className="underline italic">Contoh: 6B_Budi atau 10IPA_Siti</span>
                            </p>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-500 text-white w-full py-6 rounded-3xl font-black text-xl shadow-[0_10px_0_rgb(67,56,202)] hover:translate-y-1 hover:shadow-[0_6px_0_rgb(67,56,202)] active:translate-y-3 active:shadow-none transition-all uppercase tracking-tighter italic"
                    >
                        Gas Main! 🚀
                    </button>
                </div>

                <p className="mt-10 text-[9px] text-slate-300 font-black uppercase tracking-[0.3em]">
                    WordIT Engine • ITS Surabaya
                </p>
            </form>
        </div>
    )
}