import { Link } from "react-router-dom";
import { projects, services } from "../data/company";
import ProjectCard from "../components/ProjectCard";
import ContactCTA from "../components/ContactCTA";
export default function HomePage() {
  return (
    <div className="company-home">
      <section className="company-hero">
        <div className="company-hero-copy">
          <p className="eyebrow">
            <span className="status-dot" /> INDEPENDENT THINKING. HANDS-ON
            SOLUTIONS.
          </p>
          <h1>
            Technology.
            <br />
            With <em>roots.</em>
          </h1>
          <p className="hero-description">
            We build the web applications, repair the technology, and print the
            ideas that move you forward. Practical expertise. Personal
            attention. IronRoot Solutions.
          </p>
          <div className="hero-actions">
            <Link to="/contact" className="button">
              Let’s build something <span>↗</span>
            </Link>
            <Link to="/services" className="text-link">
              Explore our services ↓
            </Link>
          </div>
          <div className="hero-disciplines">
            <span>DESIGN & DEVELOP</span>
            <span>REPAIR & MAINTAIN</span>
            <span>PRINT & CREATE</span>
          </div>
        </div>
        <div className="hero-work">
          <div className="photo-window hero-work-photo crop-batch">
            <img
              src={projects[4].image}
              alt="Circuit-board repair work at the IronRoot Solutions workbench"
              fetchPriority="high"
              decoding="async"
            />
          </div>
          <div className="hero-work-label">
            <span>
              <b>REAL WORK. REAL SOLUTIONS.</b>
              <small>From our workbench to your next project.</small>
            </span>
            <Link to="/work" aria-label="Explore our work">
              ↗
            </Link>
          </div>
          <span className="hero-image-tag">THE IRONROOT WORKSHOP / 01</span>
        </div>
      </section>
      <div className="capability-strip">
        <span>BUILT AROUND WHAT YOU NEED</span>
        <p>Web development</p>
        <i>✳</i>
        <p>Technology repair</p>
        <i>✳</i>
        <p>3D printing</p>
        <i>✳</i>
        <p>Ongoing support</p>
      </div>
      <section className="company-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">01 / WHAT WE DO</p>
            <h2>
              One partner.
              <br />
              More ways forward.
            </h2>
          </div>
          <p>
            From the software on your screen to the hardware on your desk, we
            connect technical know-how with a practical understanding of your
            project.
          </p>
        </div>
        <div className="service-grid">
          {services.map((s) => (
            <Link className="service-card" to={`/services#${s.id}`} key={s.id}>
              <div className="service-card-top">
                <span className="service-icon">{s.icon}</span>
                <span>{s.number} /</span>
              </div>
              <h3>{s.title}</h3>
              <p>{s.description}</p>
              <span className="service-link">
                Explore service <b>↗</b>
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="company-section work-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">02 / FROM THE WORKSHOP</p>
            <h2>
              Less talk.
              <br />
              More making it work.
            </h2>
          </div>
          <Link to="/work" className="text-link">
            Explore selected work ↗
          </Link>
        </div>
        <div className="project-grid">
          {[projects[0], projects[1], projects[2]].map((p) => (
            <ProjectCard project={p} key={p.id} />
          ))}
        </div>
      </section>
      <section className="company-story">
        <div className="story-mark">
          <img src="/ironroot-mark.svg" alt="" />
          <span>
            STRONG ROOTS.
            <br />
            PRACTICAL SOLUTIONS.
          </span>
        </div>
        <div>
          <p className="eyebrow">03 / THE IRONROOT APPROACH</p>
          <h2>
            Built with care.
            <br />
            Supported with purpose.
          </h2>
          <p>
            Good technology should make life easier. We bring the same curiosity
            and care to a custom application, an electronics repair, and a part
            coming off the print bed.
          </p>
          <Link to="/about" className="text-link">
            Get to know IronRoot ↗
          </Link>
        </div>
      </section>
      <ContactCTA />
    </div>
  );
}
