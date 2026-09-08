import { NavLink } from "react-router-dom";
const links = [
  ["/", "Home"],
  ["/services", "Services"],
  ["/work", "Our work"],
  ["/3d-printing", "3D printing"],
  ["/about", "About"],
  ["/contact", "Contact"],
];
export default function Navbar() {
  return (
    <nav className="site-nav" aria-label="Main navigation">
      {links.map(([to, label]) => (
        <NavLink to={to} end={to === "/"} key={to}>
          {label}
        </NavLink>
      ))}
      <span className="nav-note">
        ROOTED IN IDEAS. BUILT FOR THE REAL WORLD.
      </span>
    </nav>
  );
}
