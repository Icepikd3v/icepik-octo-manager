import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import usePrinters from "../hooks/usePrinters";
export default function Dashboard() {
  const { user } = useAuth();
  const { printers, loading, error } = usePrinters();
  return <div className="page"><p className="eyebrow">YOUR PRINT WORKSPACE</p><div className="page-heading"><div><h1>Let’s make something.</h1><p>Welcome, {user.username}. Your next idea starts here.</p></div><Link className="button" to="/upload">New project ↗</Link></div>
    <div className="stats-grid">{[["02", "Studio printers"], [loading || error ? "—" : String(printers.filter(p => p.connected).length).padStart(2, "0"), "Printers connected"], ["Live", "Studio status"]].map(([value, label]) => <article className="stat" key={label}><strong>{value}</strong><span>{label}</span></article>)}</div>
    {error && <p role="alert" className="form-error">Printer status is temporarily unavailable.</p>}
    <div className="workspace-grid"><section className="card dark-card"><p className="eyebrow">FROM IDEA TO OBJECT</p><h2>Your work has a home.</h2><p>Keep your project files together and follow ED1 and ED2 as the studio brings ideas to life.</p><Link className="button" to="/live">Inside the print studio ↗</Link></section><section className="card"><p className="eyebrow">MAKE YOUR NEXT MOVE</p>{[["01", "Start a project", "Upload an STL or G-code file for review.", "/upload"], ["02", "Your file library", "Return to the files you’ve saved.", "/file-library"], ["03", "Follow the printers", "Live connection, temperature, and progress.", "/live"]].map(([n,h,p,to]) => <Link className="task-row" to={to} key={n}><span>{n}</span><div><h3>{h}</h3><p>{p}</p></div><b>↗</b></Link>)}</section></div>
  </div>;
}
