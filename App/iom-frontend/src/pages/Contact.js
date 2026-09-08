import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FACEBOOK_URL } from "../data/company";
const options = {
  web: "Website or web application",
  maintenance: "Maintenance & support",
  repair: "Technology repair",
  printing: "3D printing",
  installation: "Device installation",
  other: "Something else",
};
export default function Contact() {
  const [params] = useSearchParams();
  const [service, setService] = useState(
    Object.prototype.hasOwnProperty.call(options, params.get("service"))
      ? params.get("service")
      : "web",
  );
  const [details, setDetails] = useState("");
  const [name, setName] = useState("");
  const [brief, setBrief] = useState("");
  const [error, setError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  function prepare(e) {
    e.preventDefault();
    if (!name.trim() || details.trim().length < 10) {
      setError(
        "Add your name and at least 10 characters describing your project.",
      );
      return;
    }
    setError("");
    setBrief(
      `Hello IronRoot Solutions,\n\nI'm ${name.trim()}. I'd like to discuss: ${options[service]}.\n\n${details.trim()}\n\nPlease let me know the next steps.`,
    );
    setCopyStatus("");
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(brief);
      setCopyStatus(
        "Copied. Open Facebook and paste your brief into a message to IronRoot Solutions.",
      );
    } catch {
      setCopyStatus(
        "Copy is unavailable in this browser. Select and copy the brief below.",
      );
    }
  }
  return (
    <div className="page contact-page">
      <p className="eyebrow">START A CONVERSATION</p>
      <h1>
        What can we help
        <br />
        you move forward?
      </h1>
      <p className="lead">
        Tell us about your idea, your business, or the technology that needs
        attention.
      </p>
      <div className="contact-grid">
        <aside>
          <h2>A good place to start.</h2>
          <p>
            Reach IronRoot Solutions through our official Facebook page to
            discuss your project and request a quote.
          </p>
          <a
            className="button"
            href={FACEBOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Contact us on Facebook ↗
          </a>
          <div className="contact-tip">
            <p className="eyebrow">HELP US UNDERSTAND YOUR PROJECT</p>
            <ul>
              <li>What you want to build or fix</li>
              <li>Your preferred timeline and budget</li>
              <li>Relevant device models or print dimensions</li>
              <li>Any existing website or project reference</li>
            </ul>
          </div>
        </aside>
        <section className="brief-card">
          <p className="eyebrow">OPTIONAL / PREPARE YOUR MESSAGE</p>
          <h2>A little context goes a long way.</h2>
          <p>
            This prepares a message for you to copy to Facebook. Nothing is
            submitted or saved by this form.
          </p>
          <form onSubmit={prepare}>
            {error && <p role="alert">{error}</p>}
            <label>
              Your name
              <input
                required
                maxLength={100}
                autoComplete="given-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="How should we address you?"
              />
            </label>
            <label>
              What do you need?
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
              >
                {Object.entries(options).map(([v, l]) => (
                  <option value={v} key={v}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
            <label>
              About your project
              <textarea
                required
                minLength={10}
                maxLength={3000}
                rows={5}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="A short description, the goal, and any useful details…"
              />
            </label>
            <button className="button" type="submit">
              Prepare my message ↗
            </button>
          </form>
          {brief && (
            <div className="prepared-brief">
              <label htmlFor="project-brief">
                Your message — ready to copy
              </label>
              <textarea id="project-brief" readOnly value={brief} rows={8} />
              <div className="hero-actions">
                <button className="button secondary" onClick={copy}>
                  Copy message
                </button>
                <a
                  className="text-link"
                  href={FACEBOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open Facebook ↗
                </a>
              </div>
              <p role="status">{copyStatus}</p>
              <p className="fine-print">
                Your message has not been sent. Paste it into a Facebook message
                to complete your inquiry.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
