import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useSite, { SiteProvider } from "./hooks/useSite";
import { ProjectsProvider } from "./hooks/useProjects";
import Header from "./components/header";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import TechBackground from "./components/TechBackground";
import AppRoutes from "./routes/routes";
import useAuth, { AuthProvider } from "./hooks/useAuth";
import { errorMessage } from "./utils/api";
const pageTitles = {
  "/": "Web Development, Technology Repair & 3D Printing",
  "/services": "Our Services",
  "/work": "Selected Work",
  "/about": "About",
  "/3d-printing": "Custom 3D Printing",
  "/contact": "Start a Project",
  "/login": "Sign In",
  "/signup": "Create Account",
  "/watch": "Live Studio Cameras",
  "/admin": "Administration",
  "/admin/login": "Admin Sign In",
};
export default function App() { return <AuthProvider><SiteProvider><ProjectsProvider><AppShell /></ProjectsProvider></SiteProvider></AuthProvider>; }
function AppShell() {
  const { settings } = useSite();
  const { user, logout } = useAuth();
  const [logoutError, setLogoutError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const workspace = [
    "/admin/website",
    "/admin",
    "/dev",
    "/dashboard",
    "/live",
    "/upload",
    "/file-library",
  ].includes(location.pathname);
  useEffect(() => {
    document.title = `${pageTitles[location.pathname] || (workspace ? "Print Workspace" : "Project")} | IronRoot Solutions`;
    if (location.hash) {
      requestAnimationFrame(() =>
        document.getElementById(location.hash.slice(1))?.scrollIntoView(),
      );
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.hash, workspace]);
  return (
    <div className="app-shell">
      <TechBackground />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <Navbar />
      {settings.announcement && <div className="site-announcement">{settings.announcement}</div>}
      {workspace && user && (
        <div className="workspace-toolbar">
          <span>{user.username} · Print studio</span>
          <Link to="/dashboard">Workspace</Link>
          {user.isAdmin && <Link to="/admin">Admin</Link>}
          <Link to="/live">Printers</Link>
          <Link to="/upload">New project</Link>
          <Link to="/file-library">File library</Link>
          <button
            onClick={async () => {
              try { await logout(); setLogoutError(""); navigate("/login"); }
              catch (err) { setLogoutError(errorMessage(err)); }
            }}
          >
            Sign out
          </button>
        </div>
      )}
      {logoutError && <p role="alert" className="page form-error">{logoutError}</p>}
      <main id="main" tabIndex={-1}>
        <AppRoutes />
      </main>
      <Footer />
    </div>
  );
}
