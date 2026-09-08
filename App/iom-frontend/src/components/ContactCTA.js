import { Link } from "react-router-dom";
export default function ContactCTA() {
  return (
    <section className="contact-cta">
      <div>
        <p className="eyebrow">YOUR NEXT PROJECT STARTS HERE</p>
        <h2>
          Ready for the next step?
          <br />
          Let’s make it work.
        </h2>
      </div>
      <Link className="button" to="/contact">
        Tell us about your project <span>↗</span>
      </Link>
    </section>
  );
}
