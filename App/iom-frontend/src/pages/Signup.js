import { useNavigate } from "react-router-dom";
import { startDemo } from "../constants/demoAuth";
export default function Signup() {
  const navigate = useNavigate();
  return (
    <div className="page narrow">
      <section className="card">
        <p className="eyebrow">STUDIO ACCESS</p>
        <h1>Take a look around.</h1>
        <p>
          Account registration is coming later. For now, explore the development
          workspace without sharing personal details.
        </p>
        {process.env.NODE_ENV !== "production" && (
          <button
            className="button"
            onClick={() => {
              startDemo();
              navigate("/dashboard");
            }}
          >
            Enter demo workspace ↗
          </button>
        )}
      </section>
    </div>
  );
}
