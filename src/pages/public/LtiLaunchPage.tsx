import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import api from "../services/api"
import { Loader2 } from "lucide-react"

export default function LtiLaunchPage() {
  const [searchParams] = useSearchParams()
  const { loginLti } = useAuth()
  const navigate = useNavigate()
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    async function performLtiLogin() {
      const token = searchParams.get("token")
      const email = searchParams.get("email")
      const name = searchParams.get("name")
      const gameId = searchParams.get("gameId")

      if (!token || !email || !name) {
        setErrorMsg("Parameter LTI Launch tidak lengkap atau tidak valid.")
        return
      }

      try {
        // Panggil endpoint backend lti-login
        const response = await api.post("/auth/lti-login", { email, name })
        
        if (response.data.status === "success") {
          const { user, token: jwtToken } = response.data.data

          // Simpan LTI token (ltik) ke sessionStorage
          sessionStorage.setItem("ltik", token)

          // Set login state di AuthContext
          loginLti(user, jwtToken)

          // Redirect ke game arena
          if (gameId) {
            navigate(`/play/${gameId}`)
          } else {
            navigate("/student/dashboard")
          }
        } else {
          setErrorMsg("Gagal melakukan login otomatis LTI.")
        }
      } catch (err: any) {
        console.error("LTI SSO login failed:", err)
        setErrorMsg(err.response?.data?.message || "Terjadi kesalahan saat masuk via Moodle.")
      }
    }

    performLtiLogin()
  }, [searchParams, loginLti, navigate])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white font-sans p-6">
      <div className="max-w-md w-full bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-[2.5rem] p-8 text-center shadow-2xl">
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-indigo-600/20 text-indigo-400 rounded-3xl flex items-center justify-center text-4xl shadow-inner animate-pulse">
            🎓
          </div>
        </div>

        {errorMsg ? (
          <div>
            <h2 className="text-2xl font-black text-rose-500 mb-4">LTI Launch Error</h2>
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-4 rounded-2xl text-sm font-semibold mb-6">
              {errorMsg} ⚠️
            </div>
            <button 
              onClick={() => navigate("/login")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 py-3.5 rounded-full transition-all active:scale-95"
            >
              Kembali ke Login
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-black text-slate-100 mb-2">Menghubungkan ke Moodle</h2>
            <p className="text-slate-400 font-bold text-sm mb-6">Mengotentikasi sesi belajar Anda...</p>
            <div className="flex justify-center">
              <Loader2 className="animate-spin text-indigo-500" size={40} strokeWidth={3} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
