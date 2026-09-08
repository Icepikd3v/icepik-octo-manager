import PrinterCamera from "../components/PrinterCamera";
import useSite from "../hooks/useSite";
import usePrinters from "../hooks/usePrinters";
const temp = reading => Number.isFinite(reading?.actual) ? `${reading.actual.toFixed(1)} °C / ${reading.target ?? 0} °C` : "Unavailable";
export default function Live({ publicView = false }) {
  const { settings } = useSite();
  const { printers, loading, error, updatedAt, refresh } = usePrinters("/public/printers");
  return <div className="page"><p className="eyebrow">{publicView ? "LIVE FROM THE STUDIO" : "THE PRINT STUDIO"}</p><div className="page-heading"><div><h1>Made here. Happening now.</h1><p>{settings.liveIntro}</p></div><span className="pill">{loading ? "Connecting…" : error ? "Status unavailable" : `${printers.filter(p => p.connected).length} / ${printers.length} connected`}</span></div>
    {error && <p className="form-error" role="alert">{error} Last readings may be out of date.</p>}
    {loading && <p role="status">Checking the printers…</p>}
    <div className="printer-grid live-printer-grid">{printers.map((printer) => <article className="printer-card" key={printer.id}>
      <PrinterCamera printer={printer} />
      <div className="printer-details"><div className="page-heading"><h2>{printer.name}</h2><span className={`pill ${printer.connected && !error ? "online" : ""}`}>{error ? "Last known: " : ""}{printer.state}</span></div>
        {printer.message && <p>{printer.message}</p>}{printer.partial && <p>Some printer readings are temporarily unavailable.</p>}
        <dl><div><dt>Nozzle / target</dt><dd>{temp(printer.nozzle)}</dd></div><div><dt>Bed / target</dt><dd>{temp(printer.bed)}</dd></div><div><dt>Time remaining</dt><dd>{Number.isFinite(printer.job?.secondsLeft) ? `${Math.ceil(printer.job.secondsLeft / 60)} min` : "—"}</dd></div></dl>
        {Number.isFinite(printer.job?.completion) && <div className="job-progress"><label htmlFor={`progress-${printer.id}`}>{printer.job.completion.toFixed(1)}% complete</label><progress id={`progress-${printer.id}`} max="100" value={printer.job.completion} /></div>}
      </div></article>)}</div>
    <div className="upload-actions"><p className="info-note">{updatedAt ? `Last checked ${updatedAt.toLocaleTimeString()}. Refreshes every 15 seconds.` : "Live readings come directly from the studio."}</p><button className="button secondary" onClick={refresh}>Refresh status</button></div>
  </div>;
}
