import api from "./api";

export const getMyAnalytics = async () => {
    const response = await api.get("/analytics/student/me");
    return response.data.data;
};