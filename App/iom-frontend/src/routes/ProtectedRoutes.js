import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
export default function ProtectedRoute({ children }) {
  const { user, loading, error, refresh } = useAuth();
  const location = useLocation();
  if (loading) return <div className="page" role="status">Opening your workspace…</div>;
  if (error) return <div className="page narrow"><h1>We couldn’t open your workspace.</h1><p role="alert">{error}</p><button className="button" onClick={refresh}>Try again</button></div>;
  return user ? children : <Navigate to="/login" state={{ from: location.pathname }} replace />;
}
