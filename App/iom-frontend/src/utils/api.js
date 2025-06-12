// src/utils/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Interceptor to always attach token if valid
api.interceptors.request.use((config) => {
  let token = localStorage.getItem("token") || sessionStorage.getItem("token");

  // 🛡️ Validate JWT format before attaching
  if (token && typeof token === "string" && token.split(".").length === 3) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    // Remove invalid token if present
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  return config;
});

export default api;
