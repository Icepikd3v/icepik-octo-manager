import { Link } from "react-router-dom";
import { getDemoUser } from "../constants/demoAuth";
export default function Dashboard() {
  return (
    <div className="page">
      <p className="eyebrow">YOUR WORKSPACE</p>
      <div className="page-heading">
        <div>
          <h1>Let’s make something.</h1>
          <p>Welcome, {getDemoUser()?.name}. Your next idea starts here.</p>
        </div>
        <Link className="button" to="/upload">
          New project ↗
        </Link>
      </div>
      <div className="stats-grid">
        {[
          ["03", "Printers planned"],
          ["00", "Printers connected"],
          ["Demo", "Workspace mode"],
        ].map(([n, l]) => (
          <article className="stat" key={l}>
            <strong>{n}</strong>
            <span>{l}</span>
          </article>
        ))}
      </div>
      <div className="workspace-grid">
        <section className="card dark-card">
          <p className="eyebrow">A NEW CHAPTER</p>
          <h2>Rooted in possibility.</h2>
          <p>
            Welcome to the IronRoot print studio. Try the project workflow and
            explore the three printer spaces while we bring the hardware online.
          </p>
          <Link className="button" to="/live">
            Explore printers ↗
          </Link>
        </section>
        <section className="card">
          <p className="eyebrow">GET STARTED</p>
          {[
            [
              "01",
              "Preview a project",
              "Select a local G-code file.",
              "/upload",
            ],
            [
              "02",
              "Browse your files",
              "Explore sample projects.",
              "/file-library",
            ],
            [
              "03",
              "Meet the printer fleet",
              "See what’s being connected.",
              "/live",
            ],
          ].map(([n, h, p, to]) => (
            <Link className="task-row" to={to} key={n}>
              <span>{n}</span>
              <div>
                <h3>{h}</h3>
                <p>{p}</p>
              </div>
              <b>↗</b>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}
