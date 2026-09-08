import { Link } from "react-router-dom";
import Brand from "./Brand";
import { FACEBOOK_URL } from "../data/company";
export default function Footer() {
  return (
    <footer className="company-footer">
      <div className="footer-top">
        <div>
          <Link to="/" aria-label="IronRoot Solutions home">
            <Brand />
          </Link>
          <p>
            Technology with roots.
            <br />
            Ideas with purpose.
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
        </div>
        <div>
          <h2>Let’s connect</h2>
          <Link to="/contact">Start a project ↗</Link>
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
        <span>DESIGN. REPAIR. CREATE.</span>
        <Link to="/dashboard">Print studio ↗</Link>
      </div>
    </footer>
  );
}
