import { useEffect, useState } from 'react';
import api, { errorMessage } from '../utils/api';
import AdminNavigation from '../components/AdminNavigation';
import OctoPrintWorkspace from '../components/OctoPrintWorkspace';
export default function Admin() {
  const [printers, setPrinters] = useState([]), [selected, setSelected] = useState('ED1'), [visited, setVisited] = useState(['ED1']);
  const [error, setError] = useState(''), [updated, setUpdated] = useState(null), [revision, setRevision] = useState(0), [focused, setFocused] = useState(false);
  useEffect(() => {
    let disposed = false, timer; const controller = new AbortController();
    async function poll() { try { const { data } = await api.get('/admin/printers', { signal: controller.signal }); if (!disposed) { setPrinters(data.printers || []); setError(''); setUpdated(new Date()); } } catch (err) { if (!disposed) setError(errorMessage(err)); } finally { if (!disposed) timer = setTimeout(poll, 15000); } }
    poll(); return () => { disposed = true; clearTimeout(timer); controller.abort(); };
  }, [revision]);
  useEffect(() => {
    if (!focused) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const escape = event => { if (event.key === 'Escape') setFocused(false); };
    window.addEventListener('keydown', escape);
    return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', escape); };
  }, [focused]);
  function choose(id) { setSelected(id); setVisited(current => current.includes(id) ? current : [...current, id]); }
  return <div className={`admin-console ${focused ? 'admin-console-focused' : ''}`}><AdminNavigation />
    <header className="console-heading"><div><p className="eyebrow">IRONROOT / PRINTER OPERATIONS</p><h1>Print control.</h1></div><button className="button secondary" onClick={() => setFocused(!focused)}>{focused ? 'Exit focus view' : 'Focus view'}</button></header>
    <div className="console-layout"><aside className="console-sidebar"><p className="eyebrow">SELECT PRINTER</p><div role="tablist" aria-label="Printer workspaces" aria-orientation="vertical">{['ED1', 'ED2'].map(id => {
      const printer = printers.find(p => p.id === id);
      return <button key={id} role="tab" id={`tab-${id}`} aria-controls={`workspace-${id}`} aria-selected={selected === id} onClick={() => choose(id)}><strong>{id}</strong><span>{error ? 'Status unavailable' : printer?.state || 'Connecting…'}</span>{!error && Number.isFinite(printer?.job?.completion) && <progress max="100" value={printer.job.completion} aria-label={`${id} print progress`} />}</button>;
    })}</div><p className="info-note">{updated ? `Status checked ${updated.toLocaleTimeString()}` : 'Checking studio connections…'}</p><button className="button secondary" onClick={() => setRevision(value => value + 1)}>Refresh status</button><p className="info-note">Sign into OctoPrint inside each workspace. Its native controls and permissions apply.</p></aside>
      <div className="console-workspace">{error && <p role="alert">{error} The OctoPrint workspace can still be used if its connection is available.</p>}{visited.map(id => <section key={id} id={`workspace-${id}`} role="tabpanel" aria-labelledby={`tab-${id}`} hidden={selected !== id}><OctoPrintWorkspace id={id} autoOpen compact /></section>)}</div>
    </div>
  </div>;
}
