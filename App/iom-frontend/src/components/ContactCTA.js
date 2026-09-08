import { Link } from "react-router-dom";
export default function ContactCTA() {
  return (
    <section className="contact-cta">
      <div>
        <p className="eyebrow">LET’S GET TO THE ROOT OF IT</p>
        <h2>
          A new idea. A stubborn problem.
          <br />
          Let’s put it in motion.
        </h2>
      </div>
      <Link className="button" to="/contact">
        Tell us about your project <span>↗</span>
      </Link>
    </section>
  );
}
