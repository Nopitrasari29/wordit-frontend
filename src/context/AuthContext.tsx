import { createContext, useContext, useState } from "react"

const AuthContext = createContext<any>(null)

export function AuthProvider({ children }: any) {

    const [user, setUser] = useState(

        JSON.parse(localStorage.getItem("user") || "null")

    )

    function login(user: any) {

        localStorage.setItem(
            "user",
            JSON.stringify(user)
        )

        setUser(user)

    }

    function logout() {

        localStorage.removeItem("user")
        setUser(null)

    }

    return (

        <AuthContext.Provider value={{ user, login, logout }}>

            {children}

        </AuthContext.Provider>

    )

}

export function useAuth() {

    return useContext(AuthContext)

}