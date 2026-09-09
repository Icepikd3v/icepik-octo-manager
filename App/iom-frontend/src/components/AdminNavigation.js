import { NavLink } from 'react-router-dom';
export default function AdminNavigation() {
  return <nav className="admin-navigation" aria-label="Administration views"><NavLink to="/admin" end>Printer workspace</NavLink><NavLink to="/admin/website">Website & projects</NavLink></nav>;
}
