import { useEffect, useState } from 'react';
import api, { errorMessage } from '../utils/api';
import useSite from '../hooks/useSite';
function PrinterControls({ printer, refresh }) {
  const [files, setFiles] = useState([]), [selected, setSelected] = useState('');
  const [pending, setPending] = useState(null), [busy, setBusy] = useState(false), [message, setMessage] = useState(''), [error, setError] = useState('');
  async function loadFiles() { try { const { data } = await api.get(`/admin/printers/${printer.id}/files`); setFiles(data.files); setError(''); } catch (err) { setError(errorMessage(err)); } }
  async function execute() {
    setBusy(true); setError(''); setMessage('');
    try { const { data } = await api.post(`/admin/printers/${printer.id}/command`, pending); setMessage(data.message); setPending(null); await refresh(); }
    catch (err) { setError(errorMessage(err)); setPending(null); await refresh(); }
    finally { setBusy(false); }
  }
  function prepare(action) { setPending({ action, confirmPrinter: printer.id, expectedFile: printer.job?.path, ...(action === 'select' ? { path: selected } : {}) }); }
  const available = { start: printer.state === 'Operational' && printer.job?.path, pause: printer.state === 'Printing', resume: printer.state === 'Paused', cancel: ['Printing', 'Paused'].includes(printer.state) };
  return <article className="card admin-printer"><div className="page-heading"><h2>{printer.id}</h2><span className="pill">{printer.state}</span></div><p>Selected file: <strong>{printer.job?.filename || 'None'}</strong></p><p>{printer.job?.completion != null ? `${printer.job.completion.toFixed(1)}% complete` : 'No active progress'}</p>
    <button className="button secondary" onClick={loadFiles} disabled={busy}>Load printer files</button>
    <label>G-code already on {printer.id}<select value={selected} onChange={event => setSelected(event.target.value)}><option value="">Choose a file</option>{files.map(file => <option key={file.path} value={file.path}>{file.name}</option>)}</select></label>
    <button className="button secondary" disabled={!selected || busy || printer.state !== 'Operational'} onClick={() => prepare('select')}>Select file without starting</button>
    <div className="admin-actions">{['start', 'pause', 'resume', 'cancel'].map(action => <button className="button secondary" key={action} disabled={busy || !available[action]} onClick={() => prepare(action)}>{action === 'start' ? 'Start print' : `${action[0].toUpperCase()}${action.slice(1)} print`}</button>)}</div>
    {pending && <section className="command-confirm" aria-label={`Confirm ${printer.id} command`}><h3>Confirm {pending.action} on {printer.id}</h3><p>File: {pending.path || pending.expectedFile}</p><p>{pending.action === 'select' ? 'This selects the file; printing will not start.' : 'This sends a command to the physical printer.'}</p><button className="button" disabled={busy} onClick={execute}>{busy ? 'Sending…' : `Confirm ${pending.action}`}</button> <button className="button secondary" disabled={busy} onClick={() => setPending(null)}>Go back</button></section>}
    {error && <p role="alert">{error}</p>}{message && <p role="status">{message}</p>}
  </article>;
}
export default function Admin() {
  const { refresh: refreshSite } = useSite();
  const [data, setData] = useState(null), [settings, setSettings] = useState(null), [error, setError] = useState(''), [message, setMessage] = useState(''), [saving, setSaving] = useState(false);
  async function refresh() { try { const { data: result } = await api.get('/admin/overview'); setData(result); setSettings(previous => previous || result.settings); setError(''); } catch (err) { setError(errorMessage(err)); } }
  useEffect(() => { refresh(); }, []);
  async function save(event) { event.preventDefault(); setSaving(true); setMessage(''); try { const { data: result } = await api.put('/admin/site', settings); setSettings(result.settings); await refreshSite(); setMessage('Website settings saved.'); await refresh(); } catch (err) { setError(errorMessage(err)); } finally { setSaving(false); } }
  return <div className="page admin-page"><p className="eyebrow">IRONROOT / ADMINISTRATION</p><div className="page-heading"><div><h1>Your studio. Your controls.</h1><p>Operate the printers and keep the website current.</p></div><button className="button secondary" onClick={refresh}>Refresh dashboard</button></div>{error && <p role="alert">{error}</p>}{!data && !error && <p role="status">Loading administration…</p>}
    {data && <><section aria-label="Printer controls" className="printer-grid">{data.printers.map(printer => <PrinterControls key={printer.id} printer={printer} refresh={refresh} />)}</section>
    <section className="card admin-settings"><h2>Website maintenance</h2><form className="workspace-form" onSubmit={save}>
      <label>Site announcement (leave blank to hide)<textarea maxLength={240} value={settings.announcement} onChange={e => setSettings({ ...settings, announcement: e.target.value })} /></label>
      <label>Homepage introduction<textarea required maxLength={600} value={settings.homeIntro} onChange={e => setSettings({ ...settings, homeIntro: e.target.value })} /></label>
      <label>Public live-view introduction<textarea required maxLength={600} value={settings.liveIntro} onChange={e => setSettings({ ...settings, liveIntro: e.target.value })} /></label>
      <label className="admin-toggle"><input type="checkbox" checked={settings.acceptingUploads} onChange={e => setSettings({ ...settings, acceptingUploads: e.target.checked })} />Accept new project uploads</label>
      {['ED1', 'ED2'].map(id => <label className="admin-toggle" key={id}><input type="checkbox" checked={settings.cameras[id]} onChange={e => setSettings({ ...settings, cameras: { ...settings.cameras, [id]: e.target.checked } })} />Broadcast {id} camera publicly</label>)}
      <button className="button" disabled={saving}>{saving ? 'Saving…' : 'Save website settings'}</button>{message && <p role="status">{message}</p>}
    </form></section><section className="card"><h2>Recent admin activity</h2>{data.audit.length ? <ul>{data.audit.map(entry => <li key={entry._id}>{new Date(entry.createdAt).toLocaleString()} · {entry.printer || 'Website'} · {entry.action} · {entry.result}</li>)}</ul> : <p>No admin actions recorded yet.</p>}</section></>}
  </div>;
}
