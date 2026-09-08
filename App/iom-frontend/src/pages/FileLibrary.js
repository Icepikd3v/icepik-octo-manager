import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { errorMessage } from "../utils/api";
export default function FileLibrary() {
  const [files, setFiles] = useState([]), [loading, setLoading] = useState(true), [error, setError] = useState(""), [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true); setError("");
    api.get("/models").then(({ data }) => { if (active) setFiles(data); }).catch(err => { if (active) setError(errorMessage(err)); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [revision]);
  return <div className="page"><p className="eyebrow">FILE LIBRARY</p><div className="page-heading"><div><h1>Your ideas, in one place.</h1><p>Your saved project files, ready for the next conversation.</p></div><Link className="button" to="/upload">Add a file ↗</Link></div><section className="card"><h2>Project files</h2>
    {loading && <p role="status">Loading your library…</p>}{error && <div><p role="alert" className="form-error">{error}</p><button className="button" onClick={() => setRevision(n => n + 1)}>Try again</button></div>}
    {!loading && !error && !files.length && <div className="empty-library"><h3>A little space for a big idea.</h3><p>Upload your first STL or G-code file to get started.</p><Link className="text-link" to="/upload">Start a project →</Link></div>}
    {!loading && !error && files.map(file => <div className="file-row" key={file._id}><span className="file-icon">↳</span><div><h3>{file.name}</h3><p>{file.size ? `${(file.size / 1024).toFixed(1)} KB · ` : ""}{({ EnderDirect: "ED1", EnderMultiColor: "ED2" })[file.printer] || file.printer} · {new Date(file.uploadDate).toLocaleDateString()}</p></div><span className="pill">{file.status === "sent" ? "Transferred to printer" : "Saved for review"}</span></div>)}
  </section></div>;
}
