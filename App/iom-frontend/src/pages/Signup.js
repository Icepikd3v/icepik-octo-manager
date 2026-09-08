import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { errorMessage } from "../utils/api";
export default function Signup({ mode = "register", adminLogin = false }) {
  const { user, authenticate } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const register = mode === "register";
  const destination = adminLogin ? "/admin" : ["/dashboard", "/live", "/upload", "/file-library"].includes(location.state?.from) ? location.state.from : "/dashboard";
  if (user) return <Navigate to={destination} replace />;
  async function submit(event) {
    event.preventDefault(); setError(""); setBusy(true);
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try { const result = await authenticate(mode, values); if (result.verificationRequired) navigate("/verify-email", { state: { email: result.email, message: result.message }, replace: true }); else navigate(destination, { replace: true }); }
    catch (err) { if (err.response?.data?.verificationRequired) navigate("/verify-email", { state: { email: err.response.data.email }, replace: true }); else setError(errorMessage(err)); }
    finally { setBusy(false); }
  }
  return <div className="page narrow auth-page"><p className="eyebrow">{adminLogin ? "IRONROOT ADMINISTRATION" : "IRONROOT PRINT STUDIO"}</p><section className="card"><h1>{register ? "A place for your next idea." : "Welcome back."}</h1><p>{register ? "Create your account to save project files and follow the studio’s printers." : "Sign in to your files and the live print studio."}</p>
    <form className="workspace-form" onSubmit={submit}>
      {register && <label>Your name<input name="username" autoComplete="name" minLength={3} maxLength={80} required /></label>}
      <label>Email<input name="email" type="email" autoComplete="email" maxLength={254} required /></label>
      <label>Password<input name="password" type="password" autoComplete={register ? "new-password" : "current-password"} minLength={register ? 12 : undefined} maxLength={72} required /></label>
      {register && <small>Use at least 12 characters.</small>}
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button" disabled={busy}>{busy ? "Please wait…" : register ? "Create account ↗" : "Sign in ↗"}</button>
    </form>
    <p>{register ? "Already have an account? " : "New to the studio? "}<Link className="text-link" to={register ? "/login" : "/signup"} state={location.state}>{register ? "Sign in" : "Create an account"}</Link></p>
  </section></div>;
}
