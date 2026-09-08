import { Link } from "react-router-dom";
import Brand from "./Brand";
import { FACEBOOK_URL, COMPANY_EMAIL } from "../data/company";
export default function Footer() {
  return (
    <footer className="company-footer">
      <div className="footer-top">
        <div>
          <Link to="/" aria-label="IronRoot Solutions home">
            <Brand />
          </Link>
          <p>
            Built for what’s next.
            <br />
            Made to work for you.
          </p>
        </div>
        <div>
          <h2>Explore</h2>
          <Link to="/services">Our services</Link>
          <Link to="/work">Selected work</Link>
          <Link to="/about">About IronRoot</Link>
        </div>
        <div>
          <h2>Build with us</h2>
          <Link to="/services#web">Web & applications</Link>
          <Link to="/services#repair">Technology & repair</Link>
          <Link to="/3d-printing">3D printing</Link>
          <Link to="/services#security">Security & setup</Link>
        </div>
        <div>
          <h2>Let’s connect</h2>
          <Link to="/contact">Start a project ↗</Link>
          <a className="company-email" href={`mailto:${COMPANY_EMAIL}`}>{COMPANY_EMAIL}</a>
          <a
            href={FACEBOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="IronRoot Solutions on Facebook (opens in a new tab)"
          >
            Facebook ↗
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} IronRoot Solutions</span>
        <span>DESIGN. BUILD. CONNECT.</span>
        <Link to="/dashboard">Print studio ↗</Link>
      </div>
    </footer>
  );
}
