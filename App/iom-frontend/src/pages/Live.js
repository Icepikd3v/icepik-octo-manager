export default function Live() {
  return (
    <div className="page">
      <p className="eyebrow">THE PRINT STUDIO</p>
      <div className="page-heading">
        <div>
          <h1>Three spaces. Endless ideas.</h1>
          <p>
            Printer models and network connections will be confirmed in the next
            setup step.
          </p>
        </div>
        <span className="pill">0 / 3 connected</span>
      </div>
      <div className="printer-grid">
        {[1, 2, 3].map((n) => (
          <article className="printer-card" key={n}>
            <div className="printer-visual">
              <span className="printer-index">0{n}</span>
              <div className="printer-drawing" aria-hidden="true">
                <div className="printer-rail" />
                <div className="printer-head" />
                <div className="printer-bed" />
              </div>
              <span className="camera-label">CAMERA NOT CONNECTED</span>
            </div>
            <div className="printer-details">
              <div className="page-heading">
                <h2>Printer 0{n}</h2>
                <span className="pill">Not connected</span>
              </div>
              <p>Hardware details pending</p>
              <dl>
                <div>
                  <dt>Current job</dt>
                  <dd>—</dd>
                </div>
                <div>
                  <dt>Temperature</dt>
                  <dd>—</dd>
                </div>
                <div>
                  <dt>Connection</dt>
                  <dd>Awaiting setup</dd>
                </div>
              </dl>
            </div>
          </article>
        ))}
      </div>
      <p className="info-note">
        These are placeholders for the three planned printers. Live video,
        temperatures, and print controls will appear after each printer is
        configured.
      </p>
    </div>
  );
}
