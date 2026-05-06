import api from "./api";

export const getMyAnalytics = async () => {
    const response = await api.get("/analytics/me");
    return response.data.data;
};