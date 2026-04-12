type Role = "student" | "teacher" | "admin"

type User = {
    email: string
    role: Role
}

export const login = async (
    email: string,
    password: string
) => {

    if (email && password) {

        const token = "wordit-demo-token"

        const user: User = {
            email,
            role: "teacher"
        }

        localStorage.setItem("token", token)
        localStorage.setItem("user", JSON.stringify(user))

        return {
            success: true,
            token,
            user
        }

    }

    return { success: false }

}

export const register = async (
    name: string,
    email: string,
    password: string
) => {

    if (name && email && password) {

        return { success: true }

    }

    return { success: false }

}

export const logout = () => {

    localStorage.removeItem("token")
    localStorage.removeItem("user")

}