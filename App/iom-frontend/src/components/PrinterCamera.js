import { useEffect, useState } from 'react';
export default function PrinterCamera({ printer }) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState('connecting');
  const [watching, setWatching] = useState(true);
  const stream = printer.camera?.stream;
  useEffect(() => { setState('connecting'); }, [stream, attempt]);
  useEffect(() => {
    if (!stream || !watching) return;
    const timer = setTimeout(() => { setAttempt(value => value + 1); }, state === 'offline' ? 30000 : 120000);
    return () => clearTimeout(timer);
  }, [stream, watching, state, attempt]);
  return <div className="camera-panel">
    {stream && watching && state !== 'offline' && <img key={attempt} className="camera-feed" src={`${stream}?attempt=${attempt}`} alt={`Live camera from ${printer.name}`} onLoad={() => setState('live')} onError={() => setState('offline')} />}
    {(!stream || !watching || state !== 'live') && <div className="camera-placeholder"><span className="eyebrow">{printer.name} / STUDIO CAMERA</span><h3>{!watching ? 'Camera paused on this device' : !printer.camera?.enabled ? 'Not broadcasting right now' : state === 'connecting' && stream ? 'Connecting to the camera…' : 'Camera offline'}</h3><p>The studio feed will be here when the camera is available.</p></div>}
    <div className="camera-controls"><span>{stream && watching && state === 'live' ? 'Live camera' : 'Studio camera'}</span>{stream && <button type="button" onClick={() => { setWatching(!watching); setAttempt(value => value + 1); }}>{watching ? 'Stop camera' : 'Watch camera'}</button>}{state === 'offline' && watching && <button type="button" onClick={() => setAttempt(value => value + 1)}>Retry camera</button>}</div>
  </div>;
}
