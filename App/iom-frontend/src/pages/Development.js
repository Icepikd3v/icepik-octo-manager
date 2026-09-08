import { useLocation, useNavigate } from "react-router-dom";
import { startDemo, getDemoUser } from "../constants/demoAuth";
export default function Development() {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <div className="page narrow">
      <section className="card">
        <p className="eyebrow">LOCAL DEVELOPMENT ONLY</p>
        <h1>Print workspace preview.</h1>
        <p>
          Use mock access to review the upcoming order and printer workspace.
          Sample files stay in this tab. No hardware commands, payments, or
          uploads are made.
        </p>
        <button
          className="button"
          onClick={() => {
            startDemo();
            navigate(location.state?.from || "/dashboard");
          }}
        >
          {getDemoUser() ? "Return to workspace" : "Explore demo workspace"} ↗
        </button>
      </section>
    </div>
  );
}
