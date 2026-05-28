import api from "./api"

export async function register(data: any) {

    const res = await api.post("/auth/register", data)

    return res.data.data

}

export async function login(data: any) {

    const res = await api.post("/auth/login", data)

    return res.data.data

}

export async function logout() {

    const res = await api.post("/auth/logout")

    return res.data.data

}

export async function forgotPassword(email: string) {
    const res = await api.post("/auth/forgot-password", { email });
    return res.data;
}

export async function resetPassword(data: any) {
    const res = await api.post("/auth/reset-password", data);
    return res.data;
}