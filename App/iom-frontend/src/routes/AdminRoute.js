import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
export default function AdminRoute({ children }) {
  const { user, loading, error, refresh } = useAuth();
  if (loading) return <div className="page" role="status">Checking admin access…</div>;
  if (error) return <div className="page"><p role="alert">{error}</p><button className="button" onClick={refresh}>Try again</button></div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (!user.isAdmin) return <div className="page"><h1>Administrator access required.</h1><p>This account can use Print Studio, but cannot operate printers or change the website.</p></div>;
  return children;
}
