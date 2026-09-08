import { createContext, useContext, useEffect, useState } from 'react';
import api from '../utils/api';
export const defaultSite = { announcement: '', homeIntro: 'Custom 3D prints. Purpose-built software. Hardware that works. We help people and businesses turn the next idea—or the next problem—into a practical solution.', liveIntro: 'Watch ED1 and ED2 at work. Cameras may be offline while we get the studio ready or between printing sessions.', acceptingUploads: true, cameras: { ED1: true, ED2: true } };
const Context = createContext({ settings: defaultSite, refresh: () => {} });
export function SiteProvider({ children }) {
  const [settings, setSettings] = useState(defaultSite);
  async function refresh() { try { const { data } = await api.get('/public/site'); if (typeof data?.homeIntro === 'string') setSettings(data); } catch { /* Public pages retain useful copy during API outages. */ } }
  useEffect(() => { refresh(); }, []);
  return <Context.Provider value={{ settings, refresh }}>{children}</Context.Provider>;
}
export default function useSite() { return useContext(Context); }
