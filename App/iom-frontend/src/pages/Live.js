import usePrinters from "../hooks/usePrinters";
const temp = reading => Number.isFinite(reading?.actual) ? `${reading.actual.toFixed(1)} °C / ${reading.target ?? 0} °C` : "Unavailable";
export default function Live() {
  const { printers, loading, error, updatedAt, refresh } = usePrinters();
  return <div className="page"><p className="eyebrow">THE PRINT STUDIO</p><div className="page-heading"><div><h1>Made here. Happening now.</h1><p>A live look at ED1 and ED2, from the first layer to the last.</p></div><span className="pill">{loading ? "Connecting…" : error ? "Status unavailable" : `${printers.filter(p => p.connected).length} / ${printers.length} connected`}</span></div>
    {error && <p className="form-error" role="alert">{error} Last readings may be out of date.</p>}
    {loading && <p role="status">Checking the printers…</p>}
    <div className="printer-grid live-printer-grid">{printers.map((printer, index) => <article className="printer-card" key={printer.id}>
      <div className="printer-visual"><span className="printer-index">0{index + 1}</span><div className="printer-drawing" aria-hidden="true"><div className="printer-rail" /><div className="printer-head" /><div className="printer-bed" /></div><span className="camera-label">{printer.name} · PRINT STUDIO</span></div>
      <div className="printer-details"><div className="page-heading"><h2>{printer.name}</h2><span className={`pill ${printer.connected && !error ? "online" : ""}`}>{error ? "Last known: " : ""}{printer.state}</span></div>
        {printer.message && <p>{printer.message}</p>}{printer.partial && <p>Some printer readings are temporarily unavailable.</p>}
        <dl><div><dt>Current file</dt><dd>{printer.job?.filename || (printer.connected && !printer.partial ? "No file selected" : "Unavailable")}</dd></div><div><dt>Nozzle / target</dt><dd>{temp(printer.nozzle)}</dd></div><div><dt>Bed / target</dt><dd>{temp(printer.bed)}</dd></div><div><dt>Time remaining</dt><dd>{Number.isFinite(printer.job?.secondsLeft) ? `${Math.ceil(printer.job.secondsLeft / 60)} min` : "—"}</dd></div></dl>
        {Number.isFinite(printer.job?.completion) && <div className="job-progress"><label htmlFor={`progress-${printer.id}`}>{printer.job.completion.toFixed(1)}% complete</label><progress id={`progress-${printer.id}`} max="100" value={printer.job.completion} /></div>}
      </div></article>)}</div>
    <div className="upload-actions"><p className="info-note">{updatedAt ? `Last checked ${updatedAt.toLocaleTimeString()}. Refreshes every 15 seconds.` : "Live readings come directly from the studio."}</p><button className="button secondary" onClick={refresh}>Refresh status</button></div>
  </div>;
}
