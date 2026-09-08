import { Navigate, useLocation } from "react-router-dom";
import { getDemoUser } from "../constants/demoAuth";
export default function ProtectedRoute({ children }) {
  const location = useLocation();
  return getDemoUser() ? (
    children
  ) : (
    <Navigate to="/dev" state={{ from: location.pathname }} replace />
  );
}
