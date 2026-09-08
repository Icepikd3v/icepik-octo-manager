import PrinterCamera from './PrinterCamera';
import usePrinters from '../hooks/usePrinters';
export default function HomeCameras() {
  const { printers, error } = usePrinters('/public/printers');
  return <section className="company-section home-cameras" id="live-cameras" aria-labelledby="home-cameras-title">
    <div className="section-heading"><div><p className="eyebrow">FROM OUR WORKBENCH</p><h2 id="home-cameras-title">Live from the studio.</h2></div></div>
    <div className="printer-grid">{['ED1', 'ED2'].map(id => {
      const printer = (printers || []).find(item => item.id === id) || { id, name: id, camera: { enabled: true } };
      const filename = !error && printer.connected && printer.state === 'Printing' ? printer.job?.filename : null;
      return <article className="printer-card home-camera-card" key={id}><h3>{id}</h3><PrinterCamera printer={printer} />{filename && <p className="printing-filename">Now printing: <strong>{filename}</strong></p>}</article>;
    })}</div>
  </section>;
}
