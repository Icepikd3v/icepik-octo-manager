import { Link } from "react-router-dom";
export default function NotFound() {
  return (
    <div className="page narrow">
      <p className="eyebrow">404 / PAGE NOT FOUND</p>
      <h1>A little off the path.</h1>
      <p className="page-description">
        This page does not exist. Head back to the studio to keep exploring.
      </p>
      <Link className="button" to="/">
        Return to home ↗
      </Link>
    </div>
  );
}
