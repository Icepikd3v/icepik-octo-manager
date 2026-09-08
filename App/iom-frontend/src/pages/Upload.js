import { useState } from "react";
import { Link } from "react-router-dom";
export default function Upload() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  function select(f) {
    setMessage("");
    if (!f || !/\.gcode$/i.test(f.name)) {
      setFile(null);
      setMessage("Choose a .gcode file to preview.");
      return;
    }
    setFile(f);
  }
  function save() {
    try {
      const files = JSON.parse(
        sessionStorage.getItem("ironroot.demo.files") || "[]",
      );
      files.push({ id: Date.now(), name: file.name, size: file.size });
      sessionStorage.setItem("ironroot.demo.files", JSON.stringify(files));
      setMessage(
        "Added to your demo library. Only the file name and size were saved in this tab.",
      );
      setFile(null);
    } catch {
      setMessage("Could not save this preview. Please try again.");
    }
  }
  return (
    <div className="page narrow">
      <p className="eyebrow">NEW PROJECT</p>
      <h1>Start with a file.</h1>
      <p className="page-description">
        Preview the project workflow with a G-code file. Nothing is uploaded or
        sent to a printer.
      </p>
      <section
        className="dropzone"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          select(e.dataTransfer.files[0]);
        }}
      >
        <span className="upload-symbol" aria-hidden="true">
          ↥
        </span>
        <h2>{file ? file.name : "Drop your next idea here"}</h2>
        <p>
          {file
            ? `${(file.size / 1024).toFixed(1)} KB · Ready to preview`
            : "G-code files · or choose a file below"}
        </p>
        <input
          aria-label="Choose G-code file"
          type="file"
          accept=".gcode"
          onChange={(e) => {
            select(e.target.files[0]);
            e.target.value = "";
          }}
        />
      </section>
      <div className="upload-actions">
        <span>Demo only · No print will start</span>
        <button className="button" disabled={!file} onClick={save}>
          Add to demo library ↗
        </button>
      </div>
      <p role="status" className="info-note">
        {message}
      </p>
      <Link className="text-link" to="/file-library">
        Open file library →
      </Link>
    </div>
  );
}
