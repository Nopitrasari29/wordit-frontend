import { createContext, useContext, useEffect, useState } from "react"
import * as authService from "../pages/services/auth.service"

export const AuthContext = createContext<any>(null)

export function AuthProvider({ children }: any) {
  const [user, setUser] = useState<any>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    const storedToken = localStorage.getItem("token")

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
      setToken(storedToken)
    }
    setLoading(false)
  }, [])

  async function login(email: string, password: string) {
    try {
      const data = await authService.login({
        email,
        password
      })

      const { user, token } = data

      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))

      setUser(user)
      setToken(token)
      return { success: true }
    } catch (error: any) {
      console.error("Login failed:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Email atau password salah"
      }
    }
  }

  async function register(
    name: string,
    email: string,
    password: string,
    role: string,
    educationLevel?: string // Tambahkan parameter opsional ini [cite: 46, 154, 159]
  ) {
    // Kirim data ke authService [cite: 128, 159]
    return await authService.register({
      name,
      email,
      password,
      role,
      educationLevel // Sertakan field ini dalam payload API [cite: 46, 128]
    })
  }

  async function logout() {
    try {
      await authService.logout()
    } catch (error) {
      console.warn("Server-side logout failed or session already expired:", error)
    } finally {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      setUser(null)
      setToken(null)
    }
  }

  function updateUser(newUser: any) {
    localStorage.setItem("user", JSON.stringify(newUser));
    setUser(newUser);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        updateUser, // ✅ Tambahkan ini
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext)
}