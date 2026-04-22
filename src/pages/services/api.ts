import axios from "axios";

// Ekspor API_URL agar bisa diakses oleh file lain (Memperbaiki Error 1)
export const API_URL = "http://localhost:3000/api";

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Pastikan ada ekspor default (Memperbaiki Error 2)
export default api;