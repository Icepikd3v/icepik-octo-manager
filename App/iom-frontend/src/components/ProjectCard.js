import { Link } from "react-router-dom";
export default function ProjectCard({ project }) {
  return (
    <article className="project-card">
      <Link
        to={`/work/${project.id}`}
        className={`project-image photo-window crop-${project.position}`}
        aria-label={`View project: ${project.title}`}
      >
        <img
          src={project.image}
          alt={project.alt}
          loading="lazy"
          decoding="async"
        />
      </Link>
      <div className="project-caption">
        <span className="eyebrow">{project.category}</span>
        <Link to={`/work/${project.id}`}>
          <h3>
            {project.title} <span aria-hidden="true">↗</span>
          </h3>
        </Link>
        <p>{project.description}</p>
      </div>
    </article>
  );
}
