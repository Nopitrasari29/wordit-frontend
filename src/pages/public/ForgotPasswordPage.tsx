import { useState } from "react"
import { Link } from "react-router-dom"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [message, setMessage] = useState("")

    function submit(e: any) {
        e.preventDefault()
        setMessage("If the email exists, reset instructions will be sent.")
    }

    return (
        <div className="min-h-screen flex justify-center items-center p-4 bg-gradient-to-br from-indigo-100 via-blue-50 to-white relative overflow-hidden font-sans pt-28 pb-12">

            {/* Background decorations */}
            <div className="absolute top-10 right-10 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" style={{ animationDelay: '2s' }}></div>

            {/* Card Form */}
            <div className="bg-white/90 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white rounded-[3rem] p-8 md:p-12 w-full max-w-md relative z-10 text-center">

                <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-5xl mx-auto mb-8 shadow-inner">🔓</div>

                <h1 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">Forgot Password</h1>
                <p className="text-slate-500 font-semibold text-sm mb-8 leading-relaxed">
                    Enter your email address and we'll send you instructions to reset your password.
                </p>

                <form onSubmit={submit} className="space-y-6 text-left">
                    <div className="w-full flex flex-col gap-2">
                        <label className="text-sm font-bold text-slate-700 ml-2">Email Address</label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-slate-50 text-slate-800 px-6 py-4 rounded-full border-2 border-slate-100 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all font-semibold"
                        />
                    </div>

                    <button type="submit" className="w-full bg-indigo-600 text-white font-black text-lg py-4 rounded-full shadow-[0_8px_20px_rgba(79,70,229,0.3)] hover:-translate-y-1 hover:shadow-lg transition-all active:scale-95">
                        Send Reset Link
                    </button>
                </form>

                {message && (
                    <div className="mt-6 bg-emerald-50 text-emerald-600 border border-emerald-100 p-4 rounded-2xl font-bold text-sm animate-fade-in-up text-center">
                        ✅ {message}
                    </div>
                )}

                <div className="mt-8 pt-6 border-t border-slate-100">
                    <Link to="/login" className="text-slate-500 font-bold hover:text-indigo-600 transition-colors flex items-center justify-center gap-2">
                        <span className="text-xl leading-none">←</span> Back to Login
                    </Link>
                </div>
            </div>
        </div>
    )
}