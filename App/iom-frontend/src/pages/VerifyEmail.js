import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import api, { errorMessage } from '../utils/api';
export default function VerifyEmail() {
  const location = useLocation(), navigate = useNavigate();
  const { authenticate } = useAuth();
  const token = new URLSearchParams(location.hash.slice(1)).get('token') || '';
  const [email, setEmail] = useState(location.state?.email || ''), [code, setCode] = useState(''), [message, setMessage] = useState(location.state?.message || ''), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  async function verify(event) { event.preventDefault(); setBusy(true); setError(''); try { await authenticate('verify-email', { token, code }); navigate('/dashboard', { replace: true }); } catch (err) { setError(errorMessage(err)); } finally { setBusy(false); } }
  async function resend(event) { event.preventDefault(); setBusy(true); setError(''); try { const { data } = await api.post('/auth/resend-verification', { email }); setMessage(data.message); } catch (err) { setError(errorMessage(err)); } finally { setBusy(false); } }
  return <div className="page narrow auth-page"><p className="eyebrow">PRINT STUDIO / VERIFY YOUR EMAIL</p><section className="card"><h1>One more step.</h1><p>Open the link in your verification email, then enter its six-digit code. The link and code expire after 30 minutes.</p>{message && <p role="status">{message}</p>}{error && <p role="alert">{error}</p>}
    {token ? <form className="workspace-form" onSubmit={verify}><label>Verification code<input value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required /></label><button className="button" disabled={busy}>{busy ? 'Checking…' : 'Verify and open dashboard'}</button></form> : <p>Your dashboard will open after you follow the email link and verify your code.</p>}
    <form className="workspace-form" onSubmit={resend}><h2>Need a new email?</h2><label>Account email<input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required maxLength={254} /></label><button className="button secondary" disabled={busy}>Request verification email</button></form>
  </section></div>;
}
