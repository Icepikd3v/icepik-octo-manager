import { useState } from "react";
import "./TechBackground.css";

const traces = [
  "M0 110H180L240 170V330L310 400H420",
  "M0 620H120L210 530V450L280 380",
  "M120 0V70L330 280V500L400 570V800",
  "M1440 140H1260L1190 210V360L1100 450H1030",
  "M1440 670H1290L1200 580V490L1130 420",
  "M1330 0V90L1120 300V540L1060 600V800",
  "M420 0V100L500 180H650",
  "M760 800V690L850 600H990",
];

export default function TechBackground() {
  const [paused, setPaused] = useState(false);
  return <>
    <div className={`tech-background${paused ? " is-paused" : ""}`} aria-hidden="true">
      <div className="tech-background-glow" />
      <div className="tech-background-grid" />
      <svg viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice" focusable="false">
        {traces.map((d, index) => <g key={d}>
          <path className="tech-background-trace" d={d} />
          <path className="tech-background-signal" d={d} pathLength="100" style={{ animationDelay: `${-index * 2.7}s`, animationDuration: `${18 + index * 2}s` }} />
        </g>)}
        {[[310, 400], [280, 380], [1030, 450], [1130, 420], [650, 180], [990, 600]].map(([cx, cy]) =>
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4" />)}
      </svg>
    </div>
    <button type="button" className="background-motion-toggle" aria-pressed={paused}
      aria-label="Pause background animation" onClick={() => setPaused(value => !value)}>
      <span aria-hidden="true">{paused ? "▶" : "Ⅱ"}</span> Background motion
    </button>
  </>;
}
