import { useEffect, useState } from 'react';
import api, { errorMessage } from '../utils/api';
import useSite from '../hooks/useSite';
import ProjectEditor from '../components/ProjectEditor';
import AdminNavigation from '../components/AdminNavigation';
export default function AdminWebsite() {
  const { refresh: refreshSite } = useSite();
  const [data, setData] = useState(null), [settings, setSettings] = useState(null), [error, setError] = useState(''), [message, setMessage] = useState(''), [saving, setSaving] = useState(false);
  async function refresh() { try { const { data: result } = await api.get('/admin/website'); setData(result); setSettings(previous => previous || result.settings); setError(''); } catch (err) { setError(errorMessage(err)); } }
  useEffect(() => { refresh(); }, []);
  async function save(event) { event.preventDefault(); setSaving(true); setMessage(''); try { const { data: result } = await api.put('/admin/site', settings); setSettings(result.settings); await refreshSite(); setMessage('Website settings saved.'); await refresh(); } catch (err) { setError(errorMessage(err)); } finally { setSaving(false); } }
  return <div className="page admin-page"><AdminNavigation /><p className="eyebrow">IRONROOT / WEBSITE</p><div className="page-heading"><div><h1>Projects, stories, and site updates.</h1><p>Manage your public portfolio and keep customers up to date.</p></div><button className="button secondary" onClick={refresh}>Refresh dashboard</button></div>{error && <p role="alert">{error}</p>}{!data && !error && <p role="status">Loading administration…</p>}
    {data && <>
    <ProjectEditor />
    <section className="card admin-settings"><h2>Website maintenance</h2><form className="workspace-form" onSubmit={save}>
      <label>Site announcement (leave blank to hide)<textarea maxLength={240} value={settings.announcement} onChange={e => setSettings({ ...settings, announcement: e.target.value })} /></label>
      <label>Homepage introduction<textarea required maxLength={600} value={settings.homeIntro} onChange={e => setSettings({ ...settings, homeIntro: e.target.value })} /></label>
      <label>Print Studio live-view introduction<textarea required maxLength={600} value={settings.liveIntro} onChange={e => setSettings({ ...settings, liveIntro: e.target.value })} /></label>
      <label className="admin-toggle"><input type="checkbox" checked={settings.acceptingUploads} onChange={e => setSettings({ ...settings, acceptingUploads: e.target.checked })} />Accept new project uploads</label>
      {['ED1', 'ED2'].map(id => <label className="admin-toggle" key={id}><input type="checkbox" checked={settings.cameras[id]} onChange={e => setSettings({ ...settings, cameras: { ...settings.cameras, [id]: e.target.checked } })} />Broadcast {id} camera publicly</label>)}
      <button className="button" disabled={saving}>{saving ? 'Saving…' : 'Save website settings'}</button>{message && <p role="status">{message}</p>}
    </form></section><section className="card"><h2>Recent admin activity</h2>{data.audit.length ? <ul>{data.audit.map(entry => <li key={entry._id}>{new Date(entry.createdAt).toLocaleString()} · {entry.printer || 'Website'} · {entry.action} · {entry.result}</li>)}</ul> : <p>No admin actions recorded yet.</p>}</section></>}
  </div>;
}
