import { useEffect, useState } from 'react';

export default function BuildShowcase({ project }) {
  const [open, setOpen] = useState(true);
  const [revision, setRevision] = useState(0);
  const [width, setWidth] = useState('desktop');
  const [waiting, setWaiting] = useState(true);
  const [slow, setSlow] = useState(false);
  const [selected, setSelected] = useState(0);
  useEffect(() => {
    if (!project.demoUrl || !open) return;
    setWaiting(true); setSlow(false);
    const timer = setTimeout(() => setSlow(true), 15000);
    return () => clearTimeout(timer);
  }, [project.demoUrl, open, revision]);
  const screenshot = project.screenshots?.[selected];
  return <section className="build-showcase" aria-label={`${project.title} showcase`}>
    {project.stack && <ul className="build-stack" aria-label="Built with">{project.stack.map(item => <li key={item}>{item}</li>)}</ul>}
    {project.demoUrl && <>
      <div className="build-toolbar">
        <div><p className="eyebrow">INTERACTIVE DEMO</p><h2>Try the build.</h2></div>
        <div className="build-controls">
          <div role="group" aria-label="Demo display width">
            <button type="button" aria-pressed={width === 'desktop'} onClick={() => setWidth('desktop')}>Desktop</button>
            <button type="button" aria-pressed={width === 'mobile'} onClick={() => setWidth('mobile')}>Mobile</button>
          </div>
          {open && <button type="button" onClick={() => setRevision(value => value + 1)}>Reload demo</button>}
          <button type="button" onClick={() => setOpen(value => !value)}>{open ? 'Close demo' : 'Launch demo'}</button>
          <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">Open in new tab ↗</a>
        </div>
      </div>
      <p className="build-hint">{project.demoHint}</p>
      {open ? <>
        {waiting && <p role="status">{slow ? 'Taking longer than expected. Reload the demo or open it in a new tab.' : 'Opening demo…'}</p>}
        <div className={`build-frame-shell build-frame-${width}`}>
          <iframe key={revision} src={project.demoUrl} title={`${project.title} interactive demo`}
            referrerPolicy="strict-origin-when-cross-origin"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            onLoad={() => setWaiting(false)} onError={() => { setWaiting(true); setSlow(true); }} />
        </div>
        <p className="fine-print">If your browser leaves the demo blank or blocks sign-in, use “Open in new tab.”</p>
      </> : <button type="button" className="build-launch" onClick={() => setOpen(true)}>
        <img src={project.image} alt={project.alt} /><span>Launch interactive demo →</span>
      </button>}
    </>}
    {screenshot && <>
      <div className="build-toolbar"><div><p className="eyebrow">SCREENSHOT WALKTHROUGH</p><h2>Inside the build.</h2></div><p role="status">{selected + 1} / {project.screenshots.length} · {screenshot.title}</p></div>
      <div className="build-screenshots" role="group" aria-label="Choose a project screenshot">
        {project.screenshots.map((photo, index) => <button key={photo.src} type="button" aria-pressed={index === selected} onClick={() => setSelected(index)}>
          <img src={photo.src} alt="" loading="lazy" /><span>{photo.title}</span>
        </button>)}
      </div>
      <figure className="build-screen-view"><img src={screenshot.src} alt={screenshot.alt} />
        <figcaption>{screenshot.title} <a href={screenshot.src} target="_blank" rel="noopener noreferrer">Open full-size image ↗</a></figcaption>
      </figure>
    </>}
    {project.repositories?.length > 0 && <div className="hero-actions">{project.repositories.map(repo => <a key={repo.url} className="text-link" href={repo.url} target="_blank" rel="noopener noreferrer">{repo.label} ↗</a>)}</div>}
  </section>;
}
