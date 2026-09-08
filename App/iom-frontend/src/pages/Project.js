import { Link, useParams } from "react-router-dom";
import { projects, FACEBOOK_URL } from "../data/company";
import PrintingGallery from "../components/PrintingGallery";
import NotFound from "./NotFound";
export default function Project() {
  const { id } = useParams();
  const project = projects.find((p) => p.id === id);
  if (!project) return <NotFound />;
  return (
    <article className="page project-detail">
      <Link className="text-link" to="/work">
        ← Selected work
      </Link>
      <p className="eyebrow">{project.category} / WORKSHOP JOURNAL</p>
      <h1>{project.title}</h1>
      <p className="lead">{project.description}</p>
      <p className="project-date">
        {project.gallery ? "The IronRoot workshop photo collection" : `Shared by IronRoot Solutions · ${project.date}`}
      </p>
      {project.gallery ? <PrintingGallery /> : <figure>
        <img src={project.image} alt={project.alt} />
        <figcaption>
          Original company post supplied from Facebook. Any prices shown belong
          to that historical project; current projects are quoted individually.
        </figcaption>
      </figure>}
      {project.archiveImage && <details className="gallery-archive">
        <summary>Earlier from the workshop · {project.date}</summary>
        <figure><img src={project.archiveImage} loading="lazy" alt="Original workshop post showing a red printed part and a blue octopus model" />
          <figcaption>Original company post. Current projects are quoted individually.</figcaption>
        </figure>
      </details>}
      <div className="hero-actions">
        <Link className="button" to="/contact">
          Have a similar project? ↗
        </Link>
        <a
          className="text-link"
          href={FACEBOOK_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Visit IronRoot on Facebook ↗
        </a>
      </div>
    </article>
  );
}
