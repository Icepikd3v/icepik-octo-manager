import { useState } from "react";
import { projects, webPost } from "../data/company";
import { Link } from "react-router-dom";
import ProjectCard from "../components/ProjectCard";
import ContactCTA from "../components/ContactCTA";
export default function Work() {
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
          A look at real IronRoot projects, documented on our Facebook page.
          Practical fixes, custom prints, and the work that connects them.
        </p>
        <div className="work-filters" role="group" aria-label="Filter projects">
          {["All work", "3D printing", "Electronics", "Installations"].map(
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
        <div className="project-grid work-gallery">
          {list.map((p) => (
            <ProjectCard project={p} key={p.id} />
          ))}
        </div>
        <section className="web-work-card">
          <span className="service-icon">{"</>"}</span>
          <div>
            <p className="eyebrow">WEB DEVELOPMENT & DESIGN</p>
            <h2>Software is part of our roots.</h2>
            <p>
              Our work also includes custom web development and the evolving
              IronRoot print platform.
            </p>
            <div className="hero-actions">
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
