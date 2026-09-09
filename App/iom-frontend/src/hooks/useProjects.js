import { createContext, useContext, useEffect, useState } from 'react';
import api from '../utils/api';
const Context = createContext({ projects: [], loading: true, error: '', refresh: async () => {} });
export function ProjectsProvider({ children }) {
  const [data, setData] = useState({ projects: [], loading: true, error: '' });
  async function refresh() { try { const { data: result } = await api.get('/public/projects'); setData({ projects: Array.isArray(result?.projects) ? result.projects : [], loading: false, error: '' }); } catch { setData({ projects: [], loading: false, error: 'Projects are temporarily unavailable. Please try again shortly.' }); } }
  useEffect(() => { refresh(); }, []);
  return <Context.Provider value={{ ...data, refresh }}>{children}</Context.Provider>;
}
export default function useProjects() { return useContext(Context); }
