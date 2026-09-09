import useSite from "../hooks/useSite";
import { Link } from "react-router-dom";
import useProjects from "../hooks/useProjects";
import { services } from "../data/company";
import ProjectCard from "../components/ProjectCard";
import ContactCTA from "../components/ContactCTA";
import HomeCameras from "../components/HomeCameras";
import TechVisual from "../components/TechVisual";

export default function HomePage() {
  const { projects } = useProjects();
  const { settings } = useSite();
  return (
    <div className="company-home">
      <section className="company-hero future-hero">
        <div className="company-hero-copy">
          <p className="eyebrow"><span className="status-dot" /> IDEAS INTO WORKING TECHNOLOGY</p>
          <h1>Technology.<br />Built for<br /><em>what’s next.</em></h1>
          <p className="hero-description">{settings.homeIntro}</p>
          <div className="hero-actions">
            <Link to="/3d-printing" className="button">Explore 3D printing <span>↗</span></Link>
            <Link to="/services" className="text-link">Find your tech service ↗</Link>
          </div>
        </div>
        <TechVisual />
      </section>
      <div className="capability-strip">
        <span>ONE STUDIO.<br />CONNECTED CAPABILITIES.</span>
        <p>3D printing</p><i>+</i><p>Web & software</p><i>+</i><p>Hardware repair</p><i>+</i><p>Security & setup</p>
      </div>
      <HomeCameras />
      <section className="company-section entry-section">
        <div className="section-heading"><div><p className="eyebrow">01 / START HERE</p><h2>What brings you in?</h2></div><p>Choose a starting point. We’ll help you work out the details.</p></div>
        <div className="entry-grid">
          <article className="entry-card print-entry">
            <div className="entry-copy"><p className="eyebrow">MAKE SOMETHING PHYSICAL</p><h3>Your idea.<br />Off the screen.</h3><p>Explore our prints, talk through a custom piece, or upload a file to your print studio.</p>
              <Link className="button" to="/3d-printing">Find your next print ↗</Link>
              <Link className="text-link" to="/dashboard">Already have a project? Open the studio →</Link>
            </div>
            <img src="/printing/IMG_7624.jpg" alt="Blue and black printed helmeted figure, assembled on the workshop printer bed" width="1080" height="1440" loading="lazy" />
          </article>
          <article className="entry-card tech-entry">
            <div className="entry-copy"><p className="eyebrow">BUILD. REPAIR. CONNECT.</p><h3>Technology that<br />works for you.</h3><p>A web application, a software idea, hardware that needs attention, or a security-system setup. Start with what you need.</p>
              <Link className="button secondary" to="/contact">Tell us about the job ↗</Link>
              <Link className="text-link" to="/services">Explore technology services →</Link>
            </div><span className="entry-circuit" aria-hidden="true">[ IR / TECH ]</span>
          </article>
        </div>
      </section>
      <section className="company-section capabilities-section">
        <div className="section-heading"><div><p className="eyebrow">02 / OUR CAPABILITIES</p><h2>Digital thinking.<br />Hands-on execution.</h2></div><Link to="/services" className="text-link">All services ↗</Link></div>
        <div className="service-grid">
          {services.map(service => <Link className="service-card" to={service.id === "printing" ? "/3d-printing" : `/services#${service.id}`} key={service.id}>
            <div className="service-card-top"><span className="service-icon">{service.icon}</span><span>{service.number} /</span></div>
            <h3>{service.title}</h3><p>{service.description}</p><span className="service-link">Explore service <b>↗</b></span>
          </Link>)}
        </div>
      </section>
      <section className="company-section work-section">
        <div className="section-heading"><div><p className="eyebrow">03 / PROOF IN THE PROCESS</p><h2>Real projects.<br />From our workbench.</h2></div><Link to="/work" className="text-link">Explore selected work ↗</Link></div>
        <div className="project-grid">{projects.slice(0, 3).map(project => <ProjectCard project={project} key={project.id} />)}</div>
      </section>
      <section className="company-section approach-section">
        <div><p className="eyebrow">04 / THE WAY WE WORK</p><h2>Technical work.<br />A human conversation.</h2><p>Clear scope, practical recommendations, and a conversation before a commitment. You don’t need to arrive with every answer.</p><Link to="/about" className="text-link">Meet IronRoot ↗</Link></div>
        <ol className="approach-list">{[["Understand the goal", "Tell us what you want to make, improve, or get working again."], ["Agree on the plan", "We discuss feasibility, scope, timing, and price before work starts."], ["Build and hand over", "We walk through the result and the next steps for using or maintaining it."]].map(([title, description], index) => <li key={title}><span>0{index + 1}</span><div><h3>{title}</h3><p>{description}</p></div></li>)}</ol>
      </section>
      <ContactCTA />
    </div>
  );
}
