import { useState } from "react";
import { Link } from "react-router-dom";
const examples = [
  { id: "a", name: "Desk organizer.gcode", size: 248000 },
  { id: "b", name: "Prototype bracket.gcode", size: 512000 },
];
export default function FileLibrary() {
  const [files] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("ironroot.demo.files") || "[]");
    } catch {
      return [];
    }
  });
  return (
    <div className="page">
      <p className="eyebrow">FILE LIBRARY</p>
      <div className="page-heading">
        <div>
          <h1>Your ideas, in one place.</h1>
          <p>
            Local previews and sample projects. Printing becomes available after
            hardware setup.
          </p>
        </div>
        <Link className="button" to="/upload">
          Add a file ↗
        </Link>
      </div>
      <section className="card">
        <h2>Project files</h2>
        {[...files, ...examples].map((f) => (
          <div className="file-row" key={f.id}>
            <span className="file-icon">↳</span>
            <div>
              <h3>{f.name}</h3>
              <p>
                {(f.size / 1024).toFixed(1)} KB ·{" "}
                {typeof f.id === "string"
                  ? "Sample project"
                  : "Local file preview"}
              </p>
            </div>
            <span className="pill">Preview only</span>
          </div>
        ))}
      </section>
      <p className="info-note">
        Demo entries last for this browser tab. File contents are never stored,
        and no jobs are queued.
      </p>
    </div>
  );
}
