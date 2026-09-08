import { Link } from "react-router-dom";
import Brand from "./Brand";
export default function Header() {
  return (
    <header className="site-header">
      <Link to="/" aria-label="IronRoot Solutions home">
        <Brand />
      </Link>
      <div className="header-right">
        <span className="studio-label">WEB. TECH. MADE POSSIBLE.</span>
        <Link className="button small" to="/contact">
          Let’s talk <span>↗</span>
        </Link>
      </div>
    </header>
  );
}
