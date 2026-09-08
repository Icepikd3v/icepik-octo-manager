import { createContext, useContext, useEffect, useState } from "react";
import api, { errorMessage } from "../utils/api";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  async function refresh() {
    setLoading(true);
    setError("");
    try { const { data } = await api.get("/auth/me"); setUser(data.user); }
    catch (err) { setUser(null); if (err.response?.status !== 401) setError(errorMessage(err)); }
    finally { setLoading(false); }
  }
  useEffect(() => {
    refresh();
    const interceptor = api.interceptors.response.use(response => response, err => {
      if (err.response?.status === 401 && !err.config?.url?.match(/\/auth\/(login|register)/)) setUser(null);
      return Promise.reject(err);
    });
    return () => api.interceptors.response.eject(interceptor);
  }, []);
  async function authenticate(mode, values) {
    const { data } = await api.post(`/auth/${mode}`, values);
    if (data.user) setUser(data.user);
    setError("");
    return data;
  }
  async function logout() { await api.post("/auth/logout"); setUser(null); }
  return <AuthContext.Provider value={{ user, loading, error, refresh, authenticate, logout }}>{children}</AuthContext.Provider>;
}
export default function useAuth() { return useContext(AuthContext); }
