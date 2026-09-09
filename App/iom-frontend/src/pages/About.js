import { Link } from "react-router-dom";
import { RESUME_URL } from "../data/company";
import Brand from "../components/Brand";
import ContactCTA from "../components/ContactCTA";
export default function About() {
  return (
    <>
      <section className="page public-intro">
        <p className="eyebrow">ABOUT IRONROOT SOLUTIONS</p>
        <h1>
          Curiosity at the core.
          <br />
          Craft in every detail.
        </h1>
        <p className="lead">
          IronRoot brings web development, practical technology support, and
          custom fabrication together with hardware repair and connected-system setup.
        </p>
      </section>
      <section className="about-split">
        <div className="brand-panel">
          <Brand large />
          <p>DESIGN / BUILD / CONNECT</p>
          <div className="brand-panel-bottom">
            <span>IDEAS INTO WORKING TECHNOLOGY.</span>
          </div>
        </div>
        <div>
          <p className="eyebrow">TECHNICAL SKILL. PERSONAL ATTENTION.</p>
          <h2>
            Built to solve
            <br />
            real-world problems.
          </h2>
          <p>
            Our background in web development and design meets hands-on
            experience with electronics and 3D printing. That combination helps
            us approach a project from more than one angle.
          </p>
          <p>
            Sometimes the answer is a better application. Sometimes it is a
            repaired board, a thoughtful installation, or a custom part. We
            start by understanding what you need.
          </p>
          <Link className="text-link" to="/work">
            See the work behind the words ↗
          </Link>
          <p><a className="text-link" href={RESUME_URL} target="_blank" rel="noopener noreferrer">Explore Samuel Farmer’s résumé & development portfolio ↗</a></p>
        </div>
      </section>
      <section className="company-section">
        <div className="feature-grid">
          {[
            [
              "Listen first",
              "The right solution starts with your goals, budget, and the details of the problem.",
            ],
            [
              "Make it practical",
              "Useful technology should fit the way you live or work, with a scope you understand.",
            ],
            [
              "Stay involved",
              "Development and maintenance belong in the same conversation. We can discuss support as part of your project.",
            ],
          ].map(([h, p]) => (
            <article className="feature" key={h}>
              <h3>{h}</h3>
              <p>{p}</p>
            </article>
          ))}
        </div>
      </section>
      <ContactCTA />
    </>
  );
}
