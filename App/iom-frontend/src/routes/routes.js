import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "../pages/HomePage";
import Services from "../pages/Services";
import Work from "../pages/Work";
import Project from "../pages/Project";
import About from "../pages/About";
import Printing from "../pages/Printing";
import Contact from "../pages/Contact";
import NotFound from "../pages/NotFound";
import ProtectedRoute from "./ProtectedRoutes";
const Signup = lazy(() => import("../pages/Signup"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Live = lazy(() => import("../pages/Live"));
const Upload = lazy(() => import("../pages/Upload"));
const FileLibrary = lazy(() => import("../pages/FileLibrary"));
export default function AppRoutes() {
  return <Suspense fallback={<div className="page" role="status">Loading workspace…</div>}><Routes>
    <Route path="/" element={<HomePage />} /><Route path="/services" element={<Services />} /><Route path="/work" element={<Work />} /><Route path="/work/:id" element={<Project />} /><Route path="/about" element={<About />} /><Route path="/3d-printing" element={<Printing />} /><Route path="/contact" element={<Contact />} />
    <Route path="/login" element={<Signup key="login" mode="login" />} /><Route path="/signup" element={<Signup key="register" />} /><Route path="/dev" element={<Navigate to="/dashboard" replace />} />
    {[["/dashboard", Dashboard], ["/live", Live], ["/upload", Upload], ["/file-library", FileLibrary]].map(([path, Page]) => <Route key={path} path={path} element={<ProtectedRoute><Page /></ProtectedRoute>} />)}
    <Route path="*" element={<NotFound />} />
  </Routes></Suspense>;
}
