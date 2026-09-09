import { useEffect, useState } from 'react';
import api, { errorMessage } from '../utils/api';
import useProjects from '../hooks/useProjects';
import { printingPhotos } from '../data/printingGallery';
import { RESUME_URL } from '../data/company';
const blank = () => ({ title: '', category: '3D printing', description: '', body: '', date: new Date().toISOString().slice(0, 10), stage: 'Completed', status: 'draft', image: printingPhotos[0].src, alt: '', externalUrl: '' });
const fields = Object.keys(blank());
const editable = project => Object.fromEntries(fields.map(key => [key, project[key] ?? blank()[key]]));
export default function ProjectEditor() {
  const { refresh: refreshPublic } = useProjects();
  const [projects, setProjects] = useState([]), [selected, setSelected] = useState(''), [form, setForm] = useState(blank), [dirty, setDirty] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState(''), [message, setMessage] = useState('');
  async function load() { try { const { data } = await api.get('/admin/projects'); setProjects(data.projects || []); } catch (err) { setError(errorMessage(err)); } }
  useEffect(() => { load(); }, []);
  function select(id) { if (dirty && !window.confirm('Discard unsaved project changes?')) return; const project = projects.find(item => item.id === id); setSelected(id); setForm(project ? editable(project) : blank()); setDirty(false); setMessage(''); setError(''); }
  function update(key, value) { setForm(previous => ({ ...previous, [key]: value })); setDirty(true); setMessage(''); }
  async function save(event) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try { const { data } = selected ? await api.put(`/admin/projects/${selected}`, form) : await api.post('/admin/projects', form); setSelected(data.project.id); setForm(editable(data.project)); setDirty(false); await load(); await refreshPublic(); setMessage(form.status === 'published' ? 'Project published on the website.' : 'Draft saved. It is not visible to visitors.'); }
    catch (err) { setError(errorMessage(err)); } finally { setBusy(false); }
  }
  async function upload(file) {
    if (!file) return; setBusy(true); setError('');
    try { const data = new FormData(); data.append('image', file); const result = await api.post('/admin/projects/images', data); update('image', result.data.image); }
    catch (err) { setError(errorMessage(err)); } finally { setBusy(false); }
  }
  const image = form.image.startsWith('/api/public/project-images/') ? form.image.replace('/api/public/project-images/', '/api/admin/projects/images/') : form.image;
  return <section className="card portfolio-editor"><div className="page-heading"><div><p className="eyebrow">PROJECT PUBLISHING</p><h2>Prints & completed tech work</h2></div><a className="text-link" href={RESUME_URL} target="_blank" rel="noopener noreferrer">Open résumé / portfolio ↗</a></div>
    <div className="project-editor-layout"><aside><button className="button secondary" onClick={() => select('')} disabled={busy}>New project</button><div className="editor-project-list">{projects.map(project => <button key={project.id} aria-pressed={selected === project.id} onClick={() => select(project.id)} disabled={busy}><strong>{project.title}</strong><span>{project.category} · {project.status}</span></button>)}</div></aside>
      <form className="workspace-form" onSubmit={save}><h3>{selected ? 'Edit project' : 'New project draft'}</h3>
        <label>Project title<input required maxLength={120} value={form.title} onChange={e => update('title', e.target.value)} /></label>
        <div className="editor-fields"><label>Category<select value={form.category} onChange={e => update('category', e.target.value)}>{['3D printing', 'Electronics', 'Installations', 'Web & software'].map(value => <option key={value}>{value}</option>)}</select></label><label>Project stage<select value={form.stage} onChange={e => update('stage', e.target.value)}><option>In progress</option><option>Completed</option></select></label><label>Project date<input type="date" required value={form.date} onChange={e => update('date', e.target.value)} /></label></div>
        <label>Short summary<textarea required maxLength={500} value={form.description} onChange={e => update('description', e.target.value)} /></label>
        <label>Project story / completion notes<textarea rows={6} maxLength={8000} value={form.body} onChange={e => update('body', e.target.value)} /></label>
        <label>Choose a studio photo<select value={form.image} onChange={e => update('image', e.target.value)}>{!printingPhotos.some(photo => photo.src === form.image) && <option value={form.image}>Current project photo</option>}{printingPhotos.map(photo => <option value={photo.src} key={photo.id}>{photo.title}</option>)}</select></label>
        <label>Or upload a photo (JPG, PNG, WebP · up to 10 MB)<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={e => { upload(e.target.files[0]); e.target.value = ''; }} /></label>
        <label>Image description<input required maxLength={250} value={form.alt} onChange={e => update('alt', e.target.value)} /></label>
        <label>Related résumé or project URL (optional HTTPS link)<input type="url" value={form.externalUrl} onChange={e => update('externalUrl', e.target.value)} maxLength={500} placeholder={RESUME_URL} /></label>
        <label>Visibility<select value={form.status} onChange={e => update('status', e.target.value)}><option value="draft">Draft — only in website management</option><option value="published">Published — visible to visitors</option></select></label>
        <div className="editor-preview"><p className="eyebrow">PREVIEW · {form.stage}</p><img src={image} alt={form.alt || 'Project photo preview'} /><h3>{form.title || 'Project title'}</h3><p>{form.description || 'Your project summary appears here.'}</p></div>
        <button className="button" disabled={busy}>{busy ? 'Saving…' : form.status === 'published' ? 'Publish project' : 'Save draft'}</button>{selected && form.status === 'published' && <a className="text-link" href={`/work/${selected}`} target="_blank" rel="noopener noreferrer">View published project ↗</a>}
        {error && <p role="alert">{error}</p>}{message && <p role="status">{message}</p>}
      </form>
    </div>
  </section>;
}
