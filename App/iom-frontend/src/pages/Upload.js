import useSite from "../hooks/useSite";
import { useState } from "react";
import { Link } from "react-router-dom";
import api, { errorMessage } from "../utils/api";
export default function Upload() {
  const { settings } = useSite();
  const [file, setFile] = useState(null), [printer, setPrinter] = useState("ED1"), [message, setMessage] = useState(""), [error, setError] = useState(""), [busy, setBusy] = useState(false);
  function select(value) {
    if (busy || !settings.acceptingUploads) return;
    setMessage(""); setError(""); setFile(null);
    if (!value || !/\.(gcode|stl)$/i.test(value.name)) { setError("Choose an STL or G-code file."); return; }
    if (value.size > 50 * 1024 * 1024 || value.size === 0) { setError("Choose a nonempty file up to 50 MB."); return; }
    setFile(value);
  }
  async function save() {
    if (!settings.acceptingUploads) return;
    setBusy(true); setMessage(""); setError("");
    const form = new FormData(); form.append("printer", printer); form.append("file", file);
    try { await api.post("/models/upload", form, { timeout: 120000 }); setMessage("Your file is saved to your library for review."); setFile(null); }
    catch (err) { setError(errorMessage(err)); }
    finally { setBusy(false); }
  }
  return <div className="page narrow"><p className="eyebrow">NEW PROJECT</p><h1>Start with a file.</h1><p className="page-description">Save your design to your account. The studio will review preparation and printing with you.</p>
    {!settings.acceptingUploads && <p role="status">New project uploads are temporarily paused. Please contact the studio.</p>}
    <section className="dropzone" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); select(e.dataTransfer.files[0]); }}><span className="upload-symbol" aria-hidden="true">↥</span><h2>{file ? file.name : "Drop your next idea here"}</h2><p>{file ? `${(file.size / 1024).toFixed(1)} KB · Ready to upload` : "STL or G-code · Up to 50 MB"}</p><input aria-label="Choose project file" type="file" accept=".stl,.gcode" disabled={busy || !settings.acceptingUploads} onChange={e => { select(e.target.files[0]); e.target.value = ""; }} /></section>
    <label className="printer-select">Preferred printer<select value={printer} disabled={busy || !settings.acceptingUploads} onChange={e => setPrinter(e.target.value)}><option value="ED1">ED1</option><option value="ED2">ED2</option></select></label>
    <div className="upload-actions"><span>Saved for review · Printing starts after preparation</span><button className="button" disabled={!file || busy || !settings.acceptingUploads} onClick={save}>{busy ? "Uploading…" : "Upload file ↗"}</button></div>
    {error && <p role="alert" className="form-error">{error}</p>}<p role="status" className="info-note">{message}</p><Link className="text-link" to="/file-library">Open file library →</Link>
  </div>;
}
