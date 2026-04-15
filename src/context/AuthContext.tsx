import { createContext, useContext, useEffect, useState } from "react"
import * as authService from "../pages/services/auth.service"

export const AuthContext = createContext<any>(null)

export function AuthProvider({ children }: any) {

  const [user, setUser] = useState<any>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {

    const storedUser = localStorage.getItem("user")
    const storedToken = localStorage.getItem("token")

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
      setToken(storedToken)
    }

  }, [])

  async function login(email: string, password: string) {

    const data = await authService.login({
      email,
      password
    })

    const { user, token } = data

    localStorage.setItem("token", token)
    localStorage.setItem("user", JSON.stringify(user))

    setUser(user)
    setToken(token)

  }

  async function register(
    name: string,
    email: string,
    password: string,
    role: string
  ) {

    await authService.register({
      name,
      email,
      password,
      role
    })

  }

  async function logout() {

    await authService.logout()

    localStorage.removeItem("token")
    localStorage.removeItem("user")

    setUser(null)
    setToken(null)

  }

  return (

    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout
      }}
    >

      {children}

    </AuthContext.Provider>

  )

}

export function useAuth() {
  return useContext(AuthContext)
}