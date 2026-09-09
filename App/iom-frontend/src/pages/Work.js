import { useState } from "react";
import useProjects from "../hooks/useProjects";
import { RESUME_URL, webPost } from "../data/company";
import { Link } from "react-router-dom";
import ProjectCard from "../components/ProjectCard";
import ContactCTA from "../components/ContactCTA";
export default function Work() {
  const { projects, loading, error } = useProjects();
  const [filter, setFilter] = useState("All work");
  const list = projects.filter(
    (p) => filter === "All work" || p.category === filter,
  );
  return (
    <>
      <section className="page public-intro">
        <p className="eyebrow">SELECTED WORK</p>
        <h1>
          From the screen
          <br />
          to the workbench.
        </h1>
        <p className="lead">
          A look at real IronRoot projects, from workshop photos to finished results.
          Practical fixes, custom prints, and the work that connects them.
        </p>
        <div className="work-filters" role="group" aria-label="Filter projects">
          {["All work", "3D printing", "Electronics", "Installations", "Web & software"].map(
            (f) => (
              <button
                key={f}
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ),
          )}
        </div>
        <p className="sr-only" role="status">
          {list.length} projects shown
        </p>
        {loading && <p role="status">Loading projects…</p>}{error && <p role="alert">{error}</p>}
        <div className="project-grid work-gallery">
          {list.map((p) => (
            <ProjectCard project={p} key={p.id} />
          ))}
        </div>
        <section className="web-work-card">
          <span className="service-icon">{"</>"}</span>
          <div>
            <p className="eyebrow">WEB DEVELOPMENT & DESIGN</p>
            <h2>Built for the browser. Designed for people.</h2>
            <p>
              Our work also includes custom web development and the evolving
              IronRoot print platform.
            </p>
            <div className="hero-actions">
              <a className="text-link" href={RESUME_URL} target="_blank" rel="noopener noreferrer">Samuel’s résumé & development portfolio ↗</a>
              <Link className="text-link" to="/services#web">
                Explore web services ↗
              </Link>
              <a
                className="text-link"
                href={webPost}
                target="_blank"
                rel="noopener noreferrer"
              >
                Read our company post ↗
              </a>
            </div>
          </div>
        </section>
      </section>
      <ContactCTA />
    </>
  );
}
