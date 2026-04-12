import { useAuth } from "../context/AuthContext"

export default function useAuthHook() {

    const { user, token, login, logout, isAuthenticated } = useAuth()

    return {
        user,
        token,
        login,
        logout,
        isAuthenticated
    }

}