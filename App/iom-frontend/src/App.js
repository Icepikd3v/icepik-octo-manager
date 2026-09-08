import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Header from "./components/header";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import AppRoutes from "./routes/routes";
import { getDemoUser, endDemo } from "./constants/demoAuth";
const pageTitles = {
  "/": "Web Development, Technology Repair & 3D Printing",
  "/services": "Our Services",
  "/work": "Selected Work",
  "/about": "About",
  "/3d-printing": "Custom 3D Printing",
  "/contact": "Start a Project",
};
export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const workspace = [
    "/dev",
    "/dashboard",
    "/live",
    "/upload",
    "/file-library",
  ].includes(location.pathname);
  useEffect(() => {
    document.title = `${pageTitles[location.pathname] || (workspace ? "Development Workspace" : "Project")} | IronRoot Solutions`;
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
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <Navbar />
      {process.env.NODE_ENV !== "production" && workspace && getDemoUser() && (
        <div className="workspace-toolbar">
          <span>Development only · Mock access</span>
          <Link to="/dashboard">Workspace</Link>
          <Link to="/live">Printers</Link>
          <Link to="/upload">New project</Link>
          <Link to="/file-library">File library</Link>
          <button
            onClick={() => {
              endDemo();
              navigate("/dev");
            }}
          >
            Exit demo
          </button>
        </div>
      )}
      <main id="main" tabIndex={-1}>
        <AppRoutes />
      </main>
      <Footer />
    </div>
  );
}
