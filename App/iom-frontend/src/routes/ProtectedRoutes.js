import React from "react";
import { Navigate } from "react-router-dom";

// Mock authentication state
const isAuthenticated = () => {
  return localStorage.getItem("token") !== null; // Example token check
};

const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;
