import axios from "axios";

export const API_URL = "http://localhost:3000/api";

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// 🔥 KRITIKAL: Mengambil token terbaru setiap kali request dikirim
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 🔥 REVISI: Response interceptor untuk mendeteksi token expired (401 Unauthorized)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn("🔐 Sesi login kedaluwarsa atau tidak valid. Melakukan logout otomatis...");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            sessionStorage.removeItem("playerName");
            sessionStorage.removeItem("gameCode");
            sessionStorage.removeItem("activeGameRoom");
            sessionStorage.removeItem("activeGameId");
            // Redirect ke login dengan parameter status
            window.location.href = "/login?expired=true";
        }
        return Promise.reject(error);
    }
);

export default api;