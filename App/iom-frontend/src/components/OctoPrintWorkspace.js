import { useState } from 'react';
import api, { errorMessage } from '../utils/api';
export default function OctoPrintWorkspace({ id }) {
  const [open, setOpen] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState(''), [revision, setRevision] = useState(0);
  async function launch() {
    setBusy(true); setError('');
    try { await api.post('/admin/octoprint/session'); setOpen(true); setRevision(value => value + 1); }
    catch (err) { setError(errorMessage(err)); }
    finally { setBusy(false); }
  }
  return <section className="octoprint-workspace" aria-label={`${id} OctoPrint workspace`}>
    <div className="page-heading"><div><p className="eyebrow">{id} / FULL OCTOPRINT</p><h3>The complete printer workspace.</h3><p>Files, temperature, movement, terminal, timelapse, plugins and settings. Sign in with this printer’s OctoPrint account.</p></div><button className="button" disabled={busy} onClick={launch}>{busy ? 'Opening…' : open ? `Reload ${id} OctoPrint` : `Open ${id} OctoPrint`}</button></div>
    {error && <p role="alert">{error}</p>}
    {open && <><div className="octoprint-toolbar"><span>{id} · Native OctoPrint controls</span><a href={`/${id}/`} target="_blank" rel="noopener noreferrer" className="text-link">Open full page ↗</a><button className="button secondary" onClick={() => setOpen(false)}>Close workspace</button></div><iframe key={revision} title={`${id} OctoPrint controls`} src={`/${id}/`} className="octoprint-frame" allow="fullscreen" /><p className="info-note">Controls here operate {id} directly using OctoPrint’s own confirmations. If the panel stays blank or reports a connection problem, reload it or open the full page.</p></>}
  </section>;
}
