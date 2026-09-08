import { Link } from "react-router-dom";
import { projects } from "../data/company";
import ContactCTA from "../components/ContactCTA";
export default function Printing() {
  return (
    <>
      <section className="printing-hero">
        <div>
          <p className="eyebrow">IRONROOT / CUSTOM 3D PRINTING</p>
          <h1>
            You bring the idea.
            <br />
            <em>We bring it to life.</em>
          </h1>
          <p className="lead">
            Practical parts, early prototypes, and personal creations. Access
            custom FDM printing without buying and maintaining your own printer.
          </p>
          <Link className="button" to="/contact?service=printing">
            Discuss a print project ↗
          </Link>
          <p className="fine-print">
            Projects quoted individually. No membership required.
          </p>
        </div>
        <div className="photo-window crop-print printing-photo">
          <img
            src={projects[0].image}
            alt="Custom red FDM print and blue octopus model made at IronRoot"
            fetchPriority="high"
          />
        </div>
      </section>
      <section className="company-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">THE PRINT-TO-ORDER APPROACH</p>
            <h2>
              From an idea
              <br />
              to your doorstep.
            </h2>
          </div>
          <p>
            Every project starts with a conversation. We review the intended
            use, dimensions, material options, and feasibility before agreeing
            on the work.
          </p>
        </div>
        <div className="printing-steps">
          {[
            [
              "01",
              "Share your idea",
              "Tell us what the part should do, the size, quantity, and whether you already have a model.",
            ],
            [
              "02",
              "Review & quote",
              "We discuss whether the project is suitable and provide a price for printing, processing, and shipping where applicable.",
            ],
            [
              "03",
              "Make & finish",
              "After approval and payment arrangements, we prepare the file, print the part, and handle the agreed finishing.",
            ],
            [
              "04",
              "Send it your way",
              "We confirm delivery arrangements as part of the project, so you know how your finished print will reach you.",
            ],
          ].map(([n, h, p]) => (
            <article key={n}>
              <span className="feature-number">{n} /</span>
              <h3>{h}</h3>
              <p>{p}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="printing-faq company-section">
        <div>
          <p className="eyebrow">BEFORE YOUR FIRST PRINT</p>
          <h2>A few useful details.</h2>
        </div>
        <div>
          {[
            [
              "Do I need to own a printer or know how to slice files?",
              "No. Start with your idea or an existing model. We will discuss the preparation needed for a suitable print.",
            ],
            [
              "How much does a print cost?",
              "Pricing is project-specific and depends on the material, size, print time, preparation, finishing, and delivery. Request a quote before committing.",
            ],
            [
              "What can I have printed?",
              "We review each request for feasibility and suitability. Tell us the intended use, especially where a part must carry a load, withstand heat, or interact with food. Acceptance is confirmed during review.",
            ],
            [
              "Can I order and watch a print online?",
              "Online checkout and live order tracking are being prepared. For now, contact us to discuss availability and your project.",
            ],
            [
              "Do I need a subscription?",
              "No. We are starting with individual projects. Memberships and recurring plans are not required.",
            ],
          ].map(([q, a]) => (
            <details key={q}>
              <summary>
                {q}
                <span aria-hidden="true">+</span>
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
      <ContactCTA />
    </>
  );
}
