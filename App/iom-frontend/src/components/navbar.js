import { NavLink } from "react-router-dom";
const links = [
  ["/", "Home"],
  ["/3d-printing", "3D printing"],
  ["/watch", "Live cameras"],
  ["/services", "Tech services"],
  ["/work", "Our work"],
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
        DESIGN / BUILD / CONNECT
      </span>
    </nav>
  );
}
