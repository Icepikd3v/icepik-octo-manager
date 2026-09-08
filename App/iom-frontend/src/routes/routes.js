import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import Services from "../pages/Services";
import Work from "../pages/Work";
import Project from "../pages/Project";
import About from "../pages/About";
import Printing from "../pages/Printing";
import Contact from "../pages/Contact";
import NotFound from "../pages/NotFound";
import ProtectedRoute from "./ProtectedRoutes";
const dev = process.env.NODE_ENV !== "production";
const Development = dev ? lazy(() => import("../pages/Development")) : null;
const Dashboard = dev ? lazy(() => import("../pages/Dashboard")) : null;
const Live = dev ? lazy(() => import("../pages/Live")) : null;
const Upload = dev ? lazy(() => import("../pages/Upload")) : null;
const FileLibrary = dev ? lazy(() => import("../pages/FileLibrary")) : null;
export default function AppRoutes() {
  return (
    <Suspense
      fallback={
        <div className="page" role="status">
          Loading workspace…
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<Services />} />
        <Route path="/work" element={<Work />} />
        <Route path="/work/:id" element={<Project />} />
        <Route path="/about" element={<About />} />
        <Route path="/3d-printing" element={<Printing />} />
        <Route path="/contact" element={<Contact />} />
        {dev && (
          <>
            <Route path="/dev" element={<Development />} />
            {[
              ["/dashboard", Dashboard],
              ["/live", Live],
              ["/upload", Upload],
              ["/file-library", FileLibrary],
            ].map(([path, Page]) => (
              <Route
                key={path}
                path={path}
                element={
                  <ProtectedRoute>
                    <Page />
                  </ProtectedRoute>
                }
              />
            ))}
          </>
        )}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
