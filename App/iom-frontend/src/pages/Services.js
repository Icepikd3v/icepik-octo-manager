import { Link } from "react-router-dom";
import { services } from "../data/company";
import ContactCTA from "../components/ContactCTA";
export default function Services() {
  return (
    <>
      <section className="page public-intro">
        <p className="eyebrow">OUR SERVICES</p>
        <h1>
          Good technology starts
          <br />
          with the right approach.
        </h1>
        <p className="lead">
          Build something new. Improve what you have. Get a troublesome piece of
          technology working again.
        </p>
      </section>
      <div className="services-list">
        {services.map((s) => (
          <section id={s.id} className="service-detail" key={s.id}>
            <div className="service-detail-title">
              <span className="eyebrow">
                {s.number} / {s.short}
              </span>
              <h2>{s.title}</h2>
              <p>{s.description}</p>
              <Link
                className="button secondary"
                to={
                  s.id === "printing"
                    ? "/3d-printing"
                    : `/contact?service=${s.id}`
                }
              >
                {s.id === "printing"
                  ? "Explore 3D printing"
                  : "Discuss your project"}{" "}
                ↗
              </Link>
            </div>
            <div className="service-detail-list">
              {s.items.map((item, i) => (
                <div key={item}>
                  <span>0{i + 1}</span>
                  <h3>{item}</h3>
                  <span aria-hidden="true">↗</span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
      <section className="company-section process-section">
        <p className="eyebrow">HOW WE WORK</p>
        <h2>A clear plan, from the first conversation.</h2>
        <div className="feature-grid">
          {[
            [
              "01",
              "Understand",
              "Tell us what you want to achieve, what is getting in the way, and what matters most.",
            ],
            [
              "02",
              "Agree",
              "We discuss the approach, scope, and price before work begins.",
            ],
            [
              "03",
              "Deliver",
              "We build, repair, or create, then walk through the result and any next steps.",
            ],
          ].map(([n, h, p]) => (
            <article className="feature" key={n}>
              <span className="feature-number">{n}</span>
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
