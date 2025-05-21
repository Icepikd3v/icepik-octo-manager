import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import Dashboard from "../pages/Dashboard";
import Upload from "../pages/Upload";
import FileLibrary from "../pages/FileLibrary";
import Live from "../pages/Live";
import Subscription from "../pages/Subscription";
import Signup from "../pages/Signup";
import NotFound from "../pages/NotFound";
import ProtectedRoute from "./ProtectedRoutes";

//  New import
import BackendStatus from "../pages/BackendStatus";

const AppRoutes = () => (
  <Routes>
    {/* Public Routes */}
    <Route path="/" element={<HomePage />} />
    <Route path="/signup" element={<Signup />} />

    {/*  Backend Test Route (Temporary) */}
    <Route path="/backend-status" element={<BackendStatus />} />

    {/* Protected Routes */}
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/upload"
      element={
        <ProtectedRoute>
          <Upload />
        </ProtectedRoute>
      }
    />
    <Route
      path="/file-library"
      element={
        <ProtectedRoute>
          <FileLibrary />
        </ProtectedRoute>
      }
    />
    <Route
      path="/live"
      element={
        <ProtectedRoute>
          <Live />
        </ProtectedRoute>
      }
    />
    <Route
      path="/subscription"
      element={
        <ProtectedRoute>
          <Subscription />
        </ProtectedRoute>
      }
    />

    {/* Catch-All Route */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;
