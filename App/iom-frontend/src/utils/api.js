import axios from "axios";
const api = axios.create({ baseURL: "/api", timeout: 20000 });
export const errorMessage = error => error.response?.data?.message || "The service is unavailable. Check your connection and try again.";
export default api;
